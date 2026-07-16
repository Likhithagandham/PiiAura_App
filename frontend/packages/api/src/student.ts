import type {
  Announcement,
  Assignment,
  AttendanceRecord,
  Grade,
  StudentAlertsData,
  StudentDashboardData,
  StudentExamsData,
  StudentFeesData,
  StudentHelpCenterData,
  StudentHomeworkData,
  StudentLearnData,
  StudentLeaveData,
  StudentMoreData,
  StudentNoticesData,
  StudentProfileData,
  StudentTimetableData,
} from '@piiaura/types';
import { apiClient } from './client';
import { mapEduOSStudentDashboard } from './mappers/studentDashboard';
import { mapEduOSStudentHomework } from './mappers/studentHomework';
import {
  mapEduOSAnnouncements,
  mapEduOSStudentAlerts,
  mapEduOSStudentAttendance,
  mapEduOSStudentExams,
  mapEduOSStudentFees,
  mapEduOSStudentGrades,
  mapEduOSStudentHelpCenter,
  mapEduOSStudentLearn,
  mapEduOSStudentLeave,
  mapEduOSStudentNotices,
  mapEduOSStudentProfile,
  mapEduOSStudentTimetable,
} from './mappers/studentModules';
import { API_PATHS } from './paths';

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function asArray(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? (value as Record<string, unknown>[]) : [];
}

function formatInrCompact(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

export async function getStudentDashboard(): Promise<StudentDashboardData> {
  const { data } = await apiClient.get(API_PATHS.auth.studentDashboard);
  return mapEduOSStudentDashboard(data);
}

export async function getStudentAttendance(): Promise<AttendanceRecord[]> {
  const { data } = await apiClient.get(API_PATHS.attendance.studentSummary);
  return mapEduOSStudentAttendance(data);
}

export async function getStudentAssignments(): Promise<Assignment[]> {
  const { data } = await apiClient.get(API_PATHS.examinations.studentAssignments);
  const root = data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
  const assignments = Array.isArray(root.assignments) ? root.assignments : Array.isArray(data) ? data : [];
  const submissions = Array.isArray(root.submissions) ? root.submissions : [];
  const submissionByAssignment = new Map(
    submissions.map((item: Record<string, unknown>) => [String(item.assignmentId ?? ''), item]),
  );

  return assignments.map((item: Record<string, unknown>, index: number) => {
    const submission = submissionByAssignment.get(String(item.id ?? ''));
    const submissionStatus = String(submission?.submissionStatus ?? '').toLowerCase();
    const dueAt = String(item.dueAt ?? item.dueDate ?? '');
    const overdue =
      !!dueAt && !Number.isNaN(Date.parse(dueAt)) && Date.parse(dueAt) < Date.now() && !submission;
    const status: Assignment['status'] =
      submissionStatus === 'graded'
        ? 'graded'
        : submissionStatus === 'submitted' || submissionStatus === 'late'
          ? 'submitted'
          : overdue
            ? 'overdue'
            : 'pending';
    const gradedMarks = submission?.gradedMarks;
    return {
      id: String(item.id ?? `assignment-${index}`),
      title: String(item.title ?? 'Assignment'),
      description: String(item.description ?? ''),
      dueDate: dueAt,
      status,
      subject: String(item.subjectName ?? item.classLabel ?? 'Subject'),
      maxMarks: typeof item.maxMarks === 'number' ? item.maxMarks : undefined,
      obtainedMarks: typeof gradedMarks === 'number' ? gradedMarks : undefined,
    };
  });
}

export async function getStudentGrades(): Promise<Grade[]> {
  const { data } = await apiClient.get(API_PATHS.examinations.studentExams);
  return mapEduOSStudentGrades(data);
}

export async function getStudentTimetable(): Promise<StudentTimetableData> {
  const { data } = await apiClient.get(API_PATHS.academics.studentTimetable);
  return mapEduOSStudentTimetable(data);
}

export async function getStudentLearn(): Promise<StudentLearnData> {
  const [materials, assignments] = await Promise.all([
    apiClient.get(API_PATHS.academics.studentStudyMaterials),
    apiClient.get(API_PATHS.examinations.studentAssignments).catch(() => ({ data: {} })),
  ]);
  return mapEduOSStudentLearn(materials.data, assignments.data);
}

/** More hub labels are synthesized from live EduOS endpoints. */
export async function getStudentMore(): Promise<StudentMoreData> {
  const fetchSafe = async (path: string) => {
    try {
      const response = await apiClient.get(path);
      return response.data;
    } catch {
      return {};
    }
  };

  const [
    dashboardRaw,
    homeworkRaw,
    examsRaw,
    assignmentsRaw,
    attendanceRaw,
    materialsRaw,
    feesRaw,
    leaveRaw,
    announcementsRaw,
  ] = await Promise.all([
    fetchSafe(API_PATHS.auth.studentDashboard),
    fetchSafe(API_PATHS.coursework.studentHomework),
    fetchSafe(API_PATHS.examinations.studentExams),
    fetchSafe(API_PATHS.examinations.studentAssignments),
    fetchSafe(API_PATHS.attendance.studentSummary),
    fetchSafe(API_PATHS.academics.studentStudyMaterials),
    fetchSafe(API_PATHS.fees.studentFees),
    fetchSafe(API_PATHS.attendance.studentLeave),
    fetchSafe(API_PATHS.communications.studentAnnouncements),
  ]);

  const dashboard = asRecord(dashboardRaw);
  const dashboardProfile = asRecord(dashboard.profile);
  const homework = asRecord(homeworkRaw);
  const exams = asRecord(examsRaw);
  const examsHub = asRecord(exams.hub);
  const assignments = asRecord(assignmentsRaw);
  const attendance = asRecord(attendanceRaw);
  const materials = asRecord(materialsRaw);
  const fees = asRecord(feesRaw);
  const ledger = asRecord(fees.ledger);
  const leave = asRecord(leaveRaw);
  const announcements = asRecord(announcementsRaw);

  const homeworkCount = asArray(homework.homework).length;
  const publishedResultsCount = asArray(examsHub.publishedResults).length;
  const assignmentsCount = asArray(assignments.assignments).length;
  const attendancePercent =
    typeof attendance.overallPercent === 'number'
      ? Math.round(attendance.overallPercent)
      : Math.round(typeof dashboard.attendancePercent === 'number' ? dashboard.attendancePercent : 0);
  const materialFolders = asArray(materials.folders);
  const folderMaterialsCount = materialFolders.reduce((sum, folder) => {
    return sum + asArray(folder.materials ?? folder.items).length;
  }, 0);
  const materialCount = folderMaterialsCount + asArray(materials.general).length;
  const leaveCount = asArray(leave.requests).length;
  const noticesCount = asArray(announcements.announcements ?? announcementsRaw).length;
  const balanceDue =
    typeof ledger.balance === 'number'
      ? ledger.balance
      : typeof ledger.totalDue === 'number' && typeof ledger.paid === 'number'
        ? ledger.totalDue - ledger.paid
        : 0;

  return {
    heroTitle: String(dashboardProfile.name ?? 'Student Portal'),
    heroDescription: String(
      dashboardProfile.classLabel ?? dashboardProfile.className ?? 'Data synced from EduOS',
    ),
    academicSectionTitle: 'Academics',
    academicTiles: [
      { id: 'homework', label: 'Homework', subtitle: `${homeworkCount} item(s)` },
      { id: 'exams', label: 'Exams', subtitle: `${publishedResultsCount} result(s)` },
      { id: 'grades', label: 'Grades', subtitle: `${publishedResultsCount} published` },
      { id: 'assignments', label: 'Assignments', subtitle: `${assignmentsCount} assigned` },
      { id: 'attendance', label: 'Attendance', subtitle: `${attendancePercent}% overall` },
      { id: 'learn', label: 'Learn', subtitle: `${materialCount} material(s)` },
    ],
    campusSectionTitle: 'Campus',
    campusTiles: [
      { id: 'fees', label: 'Fees', subtitle: `${formatInrCompact(balanceDue)} due` },
      { id: 'leave', label: 'Leave', subtitle: `${leaveCount} request(s)` },
      { id: 'notices', label: 'Notices', subtitle: `${noticesCount} notice(s)` },
      { id: 'alerts', label: 'Alerts', subtitle: `${noticesCount} alert(s)` },
    ],
    systemSectionTitle: 'System',
    systemItems: [
      { id: 'account', label: 'My Account' },
      { id: 'help', label: 'Help & Support' },
      { id: 'logout', label: 'Log Out' },
    ],
  };
}

export async function getStudentHomework(): Promise<StudentHomeworkData> {
  const { data } = await apiClient.get(API_PATHS.coursework.studentHomework);
  return mapEduOSStudentHomework(data);
}

export async function getStudentExams(): Promise<StudentExamsData> {
  const { data } = await apiClient.get(API_PATHS.examinations.studentExams);
  return mapEduOSStudentExams(data);
}

export async function getStudentFees(): Promise<StudentFeesData> {
  const { data } = await apiClient.get(API_PATHS.fees.studentFees);
  return mapEduOSStudentFees(data);
}

export async function getStudentLeave(): Promise<StudentLeaveData> {
  const { data } = await apiClient.get(API_PATHS.attendance.studentLeave);
  return mapEduOSStudentLeave(data);
}

export async function getStudentAlerts(): Promise<StudentAlertsData> {
  const { data } = await apiClient.get(API_PATHS.communications.studentAnnouncements);
  return mapEduOSStudentAlerts(data);
}

export async function getStudentNotices(): Promise<StudentNoticesData> {
  const { data } = await apiClient.get(API_PATHS.communications.studentAnnouncements);
  return mapEduOSStudentNotices(data);
}

export async function getStudentProfile(): Promise<StudentProfileData> {
  const { data } = await apiClient.get(API_PATHS.auth.studentProfile);
  return mapEduOSStudentProfile(data);
}

export async function getStudentHelpCenter(): Promise<StudentHelpCenterData> {
  const { data } = await apiClient.get(API_PATHS.grievances.me);
  return mapEduOSStudentHelpCenter(data);
}

export async function getStudentAnnouncements(): Promise<Announcement[]> {
  const { data } = await apiClient.get(API_PATHS.communications.studentAnnouncements);
  return mapEduOSAnnouncements(data);
}

export async function getStudentDues(): Promise<unknown> {
  const { data } = await apiClient.get(API_PATHS.fees.studentDues);
  return data;
}
