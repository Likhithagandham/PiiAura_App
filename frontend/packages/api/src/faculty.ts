import type {
  Announcement,
  Assignment,
  FacultyAiToolsData,
  FacultyAlertsData,
  FacultyAssignmentsData,
  FacultyAttendanceSession,
  FacultyHelpSupportData,
  FacultyInvigilationData,
  FacultyLeaveData,
  FacultyMarksEntryData,
  FacultyNotificationPreference,
  FacultyProfileData,
  FacultySalaryData,
  FacultyScheduleData,
  FacultySettingsData,
  FacultyStudyMaterialData,
  FacultySyllabusData,
} from '@piiaura/types';
import { apiClient } from './client';
import {
  mapEduOSFacultyDashboard,
  type FacultyDashboardResponse,
} from './mappers/facultyDashboard';
import { API_PATHS } from './paths';

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function asArray(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? (value as Record<string, unknown>[]) : [];
}

function text(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim().length > 0 ? value : fallback;
}

function num(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

export type { FacultyDashboardResponse };

export async function getFacultyDashboard(): Promise<FacultyDashboardResponse> {
  const { data } = await apiClient.get(API_PATHS.auth.facultyDashboard);
  return mapEduOSFacultyDashboard(data);
}

export async function getFacultyAttendanceSession(): Promise<FacultyAttendanceSession> {
  const { data } = await apiClient.get(API_PATHS.attendance.facultyAttendance);
  const root = asRecord(data);
  const sessions = asArray(root.sessions);
  const primarySession = asRecord(sessions[0]);
  const rosterRaw = asArray(primarySession.students ?? root.records);

  const students = rosterRaw.map((student, index) => ({
    id: text(student.studentId ?? student.id, `student-${index}`),
    name: text(student.studentName ?? student.name, `Student ${index + 1}`),
    rollNumber: text(student.rollNumber ?? student.rollNo, '-'),
  }));

  const periodFromTimes = `${text(primarySession.startTime)} - ${text(primarySession.endTime)}`
    .replace(/^ - $/, '')
    .trim();

  return {
    id: text(primarySession.id, 'session-today'),
    title: text(primarySession.title ?? primarySession.classLabel, 'Today Attendance'),
    subtitle: text(primarySession.subjectName ?? primarySession.sessionType, 'Session'),
    periodLabel: text(primarySession.timeLabel, periodFromTimes || 'Today'),
    totalStudents: Math.max(num(primarySession.totalStudents), students.length),
    students,
  };
}

export async function getFacultySchedule(): Promise<FacultyScheduleData> {
  const { data } = await apiClient.get(API_PATHS.academics.facultyTimetable);
  const root = asRecord(data);
  const weekly = asRecord(root.weekly);
  const calendar = asRecord(root.calendar);
  const summary = asRecord(root.summary);

  const calendarDays = asArray(calendar.days);
  const attendanceByDate = calendarDays.reduce<Record<string, 'present' | 'absent' | 'leave' | 'holiday' | 'not_marked'>>((acc, day) => {
    const date = text(day.date);
    if (!date) return acc;

    const staffStatus = text(day.staffStatus).toLowerCase();
    const dayKind = text(day.dayKind).toLowerCase();

    if (staffStatus.includes('present')) acc[date] = 'present';
    else if (staffStatus.includes('absent')) acc[date] = 'absent';
    else if (staffStatus.includes('leave')) acc[date] = 'leave';
    else if (dayKind === 'off' || dayKind === 'holiday' || dayKind === 'vacation') acc[date] = 'holiday';
    else acc[date] = 'not_marked';

    return acc;
  }, {});

  const weeklyDays = asArray(weekly.days);
  const weekSlots = weeklyDays.flatMap((day, dayIndex) => {
    const dayLabel = text(day.dayLabel ?? day.dayName ?? day.day, `Day ${dayIndex + 1}`);
    const slots = asArray(day.slots ?? day.periods ?? day.sessions);
    return slots.map((slot, slotIndex) => ({
      id: text(slot.id, `slot-${dayIndex}-${slotIndex}`),
      time: text(slot.startTime, '--:--'),
      dayLabel,
      title: text(slot.subjectName ?? slot.title, 'Class'),
      room: text(slot.roomName ?? slot.room, 'Room'),
      duration: text(slot.duration),
      isActive: slot.isActive === true,
      emphasized: false,
    }));
  });

  const monthRaw = num(calendar.month, new Date().getMonth() + 1);
  const normalizedMonth = monthRaw > 0 ? monthRaw - 1 : 0;

  return {
    heading: 'My Timetable',
    description: 'Schedule and attendance synced from backend.',
    alertCount: num(summary.leaveDays),
    attendanceOverview: {
      presentDays: num(summary.presentDays),
      absentDays: num(summary.absentDays),
      leaveDays: num(summary.leaveDays),
      attendancePercent: num(summary.attendancePercent),
      monthLabel: text(summary.monthLabel, 'Current Month'),
    },
    attendanceByDate,
    calendarAnchor: {
      year: num(calendar.year, new Date().getFullYear()),
      month: Math.max(0, Math.min(11, normalizedMonth)),
    },
    weekly: {
      title: 'Teaching Schedule',
      semesterLabel: text(weekly.semesterLabel, 'Current Term'),
      weeks: [
        {
          weekNumber: 1,
          slots: weekSlots,
        },
      ],
      defaultWeekIndex: 0,
    },
  };
}

export async function getFacultyLeave(): Promise<FacultyLeaveData> {
  const { data } = await apiClient.get(API_PATHS.hr.facultyLeave);
  const root = asRecord(data);
  const balancesRaw = asArray(root.balances);
  const requestsRaw = asArray(root.requests);

  const balances = balancesRaw.map((balance, index) => {
    const label = text(balance.label ?? balance.leaveType ?? balance.type, `Leave ${index + 1}`);
    return {
      id: text(balance.id, `balance-${index}`),
      label,
      used: num(balance.used),
      total: Math.max(num(balance.total, 0), num(balance.used)),
      icon: /sick|medical/i.test(label) ? ('medical' as const) : ('calendar' as const),
    };
  });

  const recentRequests = requestsRaw.map((request, index) => {
    const statusRaw = text(request.status, 'pending').toLowerCase();
    const status =
      statusRaw.includes('approve')
        ? ('approved' as const)
        : statusRaw.includes('reject')
          ? ('rejected' as const)
          : ('pending' as const);

    return {
      id: text(request.id, `leave-req-${index}`),
      leaveType: text(request.leaveType ?? request.type, 'Leave'),
      dateRangeLabel: text(
        request.dateRangeLabel ?? request.dateRange ?? request.appliedFor,
        text(request.startDate, 'Date not available'),
      ),
      status,
      metaLabel: text(request.reason, 'Submitted from backend leave module'),
    };
  });

  const leaveTypes = Array.from(
    new Set(
      recentRequests
        .map((request) => request.leaveType)
        .filter((value) => value.trim().length > 0),
    ),
  );

  return {
    title: 'Leave',
    description: 'Manage your leave requests from backend HR records.',
    balances,
    leaveTypes,
    recentRequests,
    studentLeave: {
      pendingCount: 0,
      pendingDescription: 'No student leave review items were returned for this account.',
      pendingRequests: [],
      recentDecisions: [],
    },
  };
}

export async function getFacultyStudyMaterial(): Promise<FacultyStudyMaterialData> {
  const { data } = await apiClient.get(API_PATHS.academics.facultyStudyMaterials);
  const root = asRecord(data);
  const folders = asArray(root.folders);
  const general = asArray(root.general);

  const sessions = folders
    .map((folder) => text(folder.name))
    .filter(Boolean);

  return {
    title: 'Study Material',
    description:
      folders.length + general.length > 0
        ? `${folders.length} folder(s) and ${general.length} direct material bucket(s) from backend`
        : 'No study material has been uploaded in backend yet.',
    sessions: sessions.length > 0 ? sessions : ['General'],
    defaultSession: sessions[0] ?? 'General',
    tips: [
      {
        id: 'tip-allowed',
        text: 'Upload PDF, DOC, or PPT files from your device.',
        variant: 'info',
      },
      {
        id: 'tip-visibility',
        text: 'Materials become visible to students based on class and section access in backend.',
        variant: 'visibility',
      },
    ],
    emptyUploadsTitle: 'No uploads yet',
    emptyUploadsDescription: 'Backend returned no recent faculty uploads for this tenant.',
  };
}

export async function getFacultyAssignmentsScreen(): Promise<FacultyAssignmentsData> {
  const { data } = await apiClient.get(API_PATHS.examinations.facultyTeachingAssignments);
  const root = asRecord(data);
  const myClass = asRecord(root.myClass);
  const otherClasses = asRecord(root.otherClasses);

  const classNames = Array.from(
    new Set(
      [...asArray(myClass.homerooms), ...asArray(otherClasses.teachingClasses)]
        .map((classItem) => text(classItem.name ?? classItem.label ?? classItem.className))
        .filter(Boolean),
    ),
  );

  const assignmentRows = [...asArray(myClass.assignments), ...asArray(otherClasses.assignments)];
  const subjects = Array.from(
    new Set(
      assignmentRows
        .map((item) => text(item.subjectName ?? item.subject))
        .filter(Boolean),
    ),
  );

  const currentAssignments = assignmentRows.map((item, index) => ({
    id: text(item.id, `assignment-${index}`),
    title: text(item.title, `Assignment ${index + 1}`),
    subject: text(item.subjectName ?? item.subject, 'Subject'),
    className: text(item.className ?? item.classLabel, 'Class'),
    dueLabel: text(item.dueDateLabel, text(item.dueDate, 'Due date unavailable')),
    submittedCount: num(item.submittedCount ?? item.submissionsCount),
    totalStudents: Math.max(num(item.totalStudents ?? item.studentCount), 0),
    accentColor: index % 2 === 0 ? ('primary' as const) : ('tertiary' as const),
  }));

  return {
    title: 'Assignments',
    description: 'Create and monitor assignments using backend examination data.',
    classes: classNames,
    subjects,
    currentAssignments,
    reviewEmptyTitle: 'No submissions pending',
    reviewEmptyDescription: 'No pending assignment review items were returned by backend.',
    reviewRefreshLabel: 'Refresh',
  };
}

/** AI tools endpoint is planned in EduOS integrations — not yet exposed on mobile API. */
export async function getFacultyAiTools(): Promise<FacultyAiToolsData> {
  const { data } = await apiClient.get<FacultyAiToolsData>('/api/v1/integrations/ai-tools/');
  return data;
}

export async function getFacultyMarksEntry(): Promise<FacultyMarksEntryData> {
  const { data } = await apiClient.get(API_PATHS.examinations.facultyMarks);
  const root = asRecord(data);
  const myClass = asRecord(root.myClass);
  const classesITeach = asRecord(root.classesITeach);

  const classes = Array.from(
    new Set(
      [...asArray(myClass.homerooms), ...asArray(classesITeach.teachingClasses)]
        .map((item) => text(item.name ?? item.label ?? item.className))
        .filter(Boolean),
    ),
  );

  const examSlots = [...asArray(myClass.examSlots), ...asArray(classesITeach.examSlots)];
  const subjects = Array.from(
    new Set(
      examSlots
        .map((slot) => text(slot.subjectName ?? slot.subject))
        .filter(Boolean),
    ),
  );
  const examinations = Array.from(
    new Set(
      examSlots
        .map((slot) => text(slot.examName ?? slot.title))
        .filter(Boolean),
    ),
  );

  const entryRows = [...asArray(myClass.examEntries), ...asArray(classesITeach.examEntries)];
  const students = entryRows.map((entry, index) => ({
    id: text(entry.studentId ?? entry.id, `student-${index}`),
    index: index + 1,
    name: text(entry.studentName ?? entry.name, `Student ${index + 1}`),
    rollNo: text(entry.rollNo ?? entry.rollNumber, '-'),
    marks: entry.marks == null ? undefined : num(entry.marks),
  }));

  const maxMarks = Math.max(
    1,
    ...examSlots.map((slot) => num(slot.maxMarks, 0)),
    ...students.map((student) => num(student.marks, 0)),
  );

  return {
    title: 'Marks Entry',
    description: 'Enter and review marks from backend exam records.',
    classes,
    subjects,
    examinations,
    defaultClass: classes[0] ?? '',
    defaultSubject: subjects[0] ?? '',
    defaultExamination: examinations[0] ?? '',
    maxMarks,
    enrolledCount: students.length,
    students,
    saveLabel: 'Save Marks',
  };
}

export async function getFacultySyllabus(): Promise<FacultySyllabusData> {
  const { data } = await apiClient.get(API_PATHS.academics.facultySyllabus);
  const root = asRecord(data);
  const subjectsRaw = asArray(root.subjects);

  const subjects = subjectsRaw.map((subject, index) => {
    const chaptersRaw = asArray(subject.chapters ?? subject.units);
    const chapters = chaptersRaw.map((chapter, chapterIndex) => ({
      id: text(chapter.id, `chapter-${index}-${chapterIndex}`),
      title: text(chapter.title ?? chapter.name, `Unit ${chapterIndex + 1}`),
      status: 'upcoming' as const,
    }));

    const progress = Math.max(0, Math.min(100, num(subject.progressPercent ?? subject.percent)));
    const status = progress >= 60 ? ('on-track' as const) : ('pending-review' as const);

    return {
      id: text(subject.id, `subject-${index}`),
      name: text(subject.name ?? subject.subjectName, `Subject ${index + 1}`),
      classLabel: text(subject.classLabel ?? subject.className, 'Class'),
      percent: progress,
      status,
      statusLabel: status === 'on-track' ? 'On Track' : 'Pending Review',
      lastUpdatedLabel: text(subject.lastUpdatedLabel ?? subject.updatedAt, 'Updated recently'),
      chapters,
    };
  });

  const focusSubject = subjects[0];

  return {
    title: 'Syllabus Progress',
    description: 'Track topic coverage from backend syllabus records.',
    currentFocus: {
      subjectLabel: focusSubject?.name ?? 'No active subject',
      percent: focusSubject?.percent ?? 0,
      nextChapter: focusSubject?.chapters[0]?.title ?? 'No chapter assigned',
      updateTopicsLabel: 'Update topics',
    },
    otherSubjectsLabel: 'Other Subjects',
    subjects,
    addSubjectLabel: 'Add Subject',
    addSubjectOptions: {
      subjectNames: subjects.map((subject) => subject.name),
      classLabels: Array.from(new Set(subjects.map((subject) => subject.classLabel))),
    },
  };
}

export async function getFacultyInvigilation(): Promise<FacultyInvigilationData> {
  const { data } = await apiClient.get(API_PATHS.examinations.facultyInvigilation);
  const root = asRecord(data);
  const assignments = asArray(root.assignments);

  const duties = assignments.map((assignment, index) => ({
    id: text(assignment.id, `duty-${index}`),
    examSlot: text(
      assignment.examSlot ?? assignment.slotLabel,
      `${text(assignment.examName, 'Exam')} ${text(assignment.timeRange, '')}`.trim() || 'Exam duty',
    ),
    assignedBy: text(assignment.assignedBy, 'Academic Office'),
    assignedByAuto: assignment.assignedByAuto === true,
    assignedAtLabel: text(assignment.assignedAtLabel ?? assignment.assignedAt, 'Recently assigned'),
  }));

  const autoAssignedCount = duties.filter((duty) => duty.assignedByAuto).length;

  return {
    title: 'Invigilation',
    description: 'Exam duty assignments synced from backend.',
    scopeLabel: 'Faculty',
    alert: {
      title: duties.length > 0 ? 'Upcoming duties assigned' : 'No invigilation duties',
      description:
        duties.length > 0
          ? `You have ${duties.length} duty assignment(s) from backend.`
          : 'No invigilation assignments were returned for this faculty account.',
      actionLabel: 'View leave',
    },
    dutiesTitle: 'Assigned Duties',
    dutiesSubtitle: 'Latest duty allocations from examinations module',
    refreshLabel: 'Refresh',
    duties,
    emptyDutiesMessage: 'No invigilation duties found.',
    stats: [
      { id: 'total', label: 'Total Duties', value: String(duties.length), variant: 'secondary' },
      { id: 'auto', label: 'Auto Assigned', value: String(autoAssignedCount), variant: 'neutral' },
    ],
  };
}

export async function getFacultySalary(): Promise<FacultySalaryData> {
  const { data } = await apiClient.get(API_PATHS.hr.facultyPayslip);
  const root = asRecord(data);
  const monthsRaw = asArray(root.months);
  const result = asRecord(root.result);

  const months = monthsRaw.map((month, index) => ({
    id: text(month.id ?? month.value ?? month.monthKey, `month-${index}`),
    label: text(month.label ?? month.name ?? month.monthName, `Month ${index + 1}`),
  }));

  const selectedMonth = text(root.selectedMonth, months[0]?.id ?? '');
  const netAmount = text(
    result.netPayable ?? result.netSalary,
    result.netPayableAmount == null ? '' : String(result.netPayableAmount),
  );

  return {
    netPayableLabel: 'Net Payable',
    netPayableValue: netAmount || 'Not processed',
    lastProcessedLabel: 'Last Processed',
    lastProcessedValue: text(result.processedAt ?? result.generatedAt, 'Not processed'),
    salarySlipTitle: 'Salary Slip',
    historyLabel: 'History',
    monthLabel: 'Month',
    months,
    defaultMonthId: selectedMonth,
    payrollError: {
      title: 'Payroll Not Processed',
      descriptionTemplate: 'Payroll is not processed for {month}.',
      notifyLabel: 'Notify Accounts',
    },
    documentsSectionTitle: 'Documents',
    documents: [],
    support: {
      title: 'Need help with payroll?',
      description: 'Contact payroll support for salary issues.',
      actionLabel: 'Contact Support',
    },
  };
}

export async function getFacultyAlerts(): Promise<FacultyAlertsData> {
  const { data } = await apiClient.get(API_PATHS.communications.facultyAnnouncements);
  const root = asRecord(data);
  const announcements = asArray(root.announcements);

  const alerts = announcements.map((item, index) => {
    const createdAt = text(item.createdAt ?? item.sentAt);
    const categoryRaw = text(item.targetType, 'academic').toLowerCase();
    const category: 'academic' | 'administrative' | 'system' =
      categoryRaw === 'branch' || categoryRaw === 'all' ? 'administrative' : 'academic';

    return {
      id: text(item.id, `alert-${index}`),
      category,
      severity: 'academic' as const,
      severityLabel: 'Announcement',
      timeLabel: createdAt ? new Date(createdAt).toLocaleDateString('en-IN') : 'Recently',
      title: text(item.title, 'Announcement'),
      description: text(item.body ?? item.message, ''),
      actions: [
        {
          id: `dismiss-${index}`,
          label: 'Dismiss',
          variant: 'dismiss' as const,
        },
      ],
      featured: index === 0,
    };
  });

  return {
    sectionTitle: 'Alerts',
    sectionDescription: 'Faculty announcements from backend communications module.',
    markAllReadLabel: 'Mark all read',
    filters: [
      { id: 'all', label: 'All' },
      { id: 'academic', label: 'Academic' },
      { id: 'administrative', label: 'Administrative' },
      { id: 'system', label: 'System' },
    ],
    alerts,
    emptyTitle: 'No alerts yet',
    emptyDescription: 'No faculty announcements were returned by backend for this tenant.',
  };
}

export async function getFacultyProfile(): Promise<FacultyProfileData> {
  const { data } = await apiClient.get(API_PATHS.auth.facultyProfile);
  const root = asRecord(data);

  const name = text(root.name, 'Faculty');
  const designation = text(root.designation, 'Faculty');
  const department = text(root.department, 'Not set');
  const loginId = text(root.customLoginId, 'Not set');
  const ownPhone = text(root.ownPhone, 'Not set');
  const userId = text(root.userId, 'Not set');

  return {
    name,
    designation,
    avatarUrl: text(root.profilePictureUrl ?? root.avatarUrl, ''),
    verified: true,
    badges: [
      { id: 'badge-role', label: designation, variant: 'primary' },
      { id: 'badge-dept', label: department, variant: 'secondary' },
    ],
    personalInfo: {
      id: 'personal',
      title: 'Personal Information',
      fields: [
        { label: 'Name', value: name, emphasized: true },
        { label: 'Phone', value: ownPhone },
        { label: 'User ID', value: userId },
      ],
    },
    workInfo: {
      id: 'work',
      title: 'Work Information',
      fields: [
        { label: 'Faculty ID', value: loginId, emphasized: true },
        { label: 'Designation', value: designation },
        { label: 'Department', value: department },
      ],
    },
    attendance: {
      label: 'Attendance',
      percent: num(root.attendancePercent),
      periodLabel: 'This month',
    },
    accountSettingsLabel: 'Account Settings',
    settings: [
      { id: 'settings', label: 'Notification Settings' },
      { id: 'password', label: 'Change Password' },
    ],
    logoutLabel: 'Logout',
  };
}

export async function getFacultySettings(): Promise<FacultySettingsData> {
  const [profileResult, prefsResult] = await Promise.allSettled([
    apiClient.get(API_PATHS.auth.facultyProfile),
    apiClient.get(API_PATHS.communications.notificationPreferences),
  ]);

  const profile =
    profileResult.status === 'fulfilled' ? asRecord(profileResult.value.data) : ({} as Record<string, unknown>);
  const channels =
    prefsResult.status === 'fulfilled'
      ? asRecord(asRecord(prefsResult.value.data).channels)
      : ({} as Record<string, unknown>);

  const name = text(profile.name, 'Faculty');
  const subtitle = text(profile.departmentName, text(profile.designation, 'Faculty Portal'));
  const avatarUrl = text(profile.profilePictureUrl, text(profile.avatarUrl, ''));
  const facultyId = text(profile.customLoginId, text(profile.employeeId, 'Not assigned'));

  const preferences: FacultyNotificationPreference[] = [
    {
      id: 'in-app',
      title: 'In-app notifications',
      description: 'Receive announcements and updates inside the app.',
      enabled: channels.in_app !== false,
    },
    {
      id: 'sms',
      title: 'SMS alerts',
      description: 'Get urgent updates via SMS on your registered number.',
      enabled: channels.sms !== false,
    },
    {
      id: 'email',
      title: 'Email notifications',
      description: 'Receive summaries and important communication by email.',
      enabled: channels.email !== false,
    },
  ];

  return {
    name,
    subtitle,
    avatarUrl,
    headerAvatarUrl: avatarUrl,
    employeeIdLabel: `Faculty ID: ${facultyId}`,
    notificationsTitle: 'Notification Preferences',
    preferences,
    saveLabel: 'Save Preferences',
    saveFootnote: 'Changes are saved directly to backend notification preferences.',
    privacyTitle: 'Privacy Controls',
    privacyDescription:
      'Notification channels are managed from your backend communication profile settings.',
  };
}

export async function updateFacultySettingsPreferences(
  preferences: FacultyNotificationPreference[],
): Promise<void> {
  const enabledById = preferences.reduce<Record<FacultyNotificationPreference['id'], boolean>>(
    (acc, preference) => {
      acc[preference.id] = preference.enabled;
      return acc;
    },
    { 'in-app': true, sms: true, email: true },
  );

  await apiClient.patch(API_PATHS.communications.notificationPreferences, {
    in_app: enabledById['in-app'],
    sms: enabledById.sms,
    email: enabledById.email,
  });
}

export async function getFacultyHelpSupport(): Promise<FacultyHelpSupportData> {
  const [profileResult, prefsResult, announcementsResult] = await Promise.allSettled([
    apiClient.get(API_PATHS.auth.facultyProfile),
    apiClient.get(API_PATHS.communications.notificationPreferences),
    apiClient.get(API_PATHS.communications.facultyAnnouncements),
  ]);

  const profile =
    profileResult.status === 'fulfilled' ? asRecord(profileResult.value.data) : ({} as Record<string, unknown>);
  const prefs =
    prefsResult.status === 'fulfilled' ? asRecord(prefsResult.value.data) : ({} as Record<string, unknown>);
  const channels = asRecord(prefs.channels);
  const announcements =
    announcementsResult.status === 'fulfilled'
      ? asArray(asRecord(announcementsResult.value.data).announcements)
      : [];

  const channelFaqs = [
    {
      id: 'in-app',
      question: 'In-app notifications',
      answer: channels.in_app === false ? 'Disabled in backend preferences' : 'Enabled in backend preferences',
    },
    {
      id: 'sms',
      question: 'SMS notifications',
      answer: channels.sms === false ? 'Disabled in backend preferences' : 'Enabled in backend preferences',
    },
    {
      id: 'email',
      question: 'Email notifications',
      answer: channels.email === false ? 'Disabled in backend preferences' : 'Enabled in backend preferences',
    },
  ];

  const contacts = [
    {
      id: 'login-id',
      label: 'Faculty ID',
      value: text(profile.customLoginId, 'Not set'),
      hint: 'From faculty profile',
    },
    {
      id: 'phone',
      label: 'Phone',
      value: text(profile.ownPhone, 'Not set'),
      hint: 'From faculty profile',
    },
  ];

  const quickLinks = announcements.slice(0, 3).map((item, index) => {
    const title = text(item.title, `Announcement ${index + 1}`);
    const body = text(item.body, 'Open the announcements module for details');
    return {
      id: text(item.id, `ann-${index}`),
      label: title,
      description: body,
    };
  });

  return {
    title: 'Help & Support',
    description: `Backend-connected support for ${text(profile.name, 'Faculty')}`,
    faqSectionTitle: 'Notification preferences',
    faqs: channelFaqs,
    contactSectionTitle: 'Profile contacts',
    contacts,
    quickLinksTitle: 'Recent announcements',
    quickLinks:
      quickLinks.length > 0
        ? quickLinks
        : [
            {
              id: 'ann-empty',
              label: 'No announcements available',
              description: 'Backend returned an empty faculty announcements list',
            },
          ],
    submitTicketLabel: 'Raise support ticket',
    submitTicketFootnote: 'Ticket API is not exposed for faculty in current backend',
  };
}

export async function getFacultyAnnouncements(): Promise<Announcement[]> {
  const { data } = await apiClient.get<Announcement[]>(API_PATHS.communications.facultyAnnouncements);
  return data;
}

export async function getFacultyAssignments(): Promise<Assignment[]> {
  const { data } = await apiClient.get<Assignment[]>(API_PATHS.examinations.facultyTeachingAssignments);
  return data;
}

export async function saveFacultyInternalMarks(payload: unknown): Promise<void> {
  await apiClient.post(API_PATHS.examinations.facultyInternalMarksSave, payload);
}

export async function bulkMarkFacultyAttendance(payload: unknown): Promise<void> {
  await apiClient.post(API_PATHS.attendance.facultyBulkMark, payload);
}
