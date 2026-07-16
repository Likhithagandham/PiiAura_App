import type {
  Announcement,
  AttendanceRecord,
  Grade,
  StudentAlertsData,
  StudentExamsData,
  StudentFeesData,
  StudentHelpCenterData,
  StudentLearnData,
  StudentLeaveData,
  StudentNoticesData,
  StudentProfileData,
  StudentTimetableData,
} from '@piiaura/types';

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function asArray<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function text(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.length > 0 ? value : fallback;
}

function num(value: unknown, fallback = 0): number {
  return typeof value === 'number' && !Number.isNaN(value) ? value : fallback;
}

/** EduOS fees ledger amounts are already in rupees (floats), not paise. */
function moneyAmount(value: unknown): number {
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

function formatInr(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

function formatDateLabel(iso?: string): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(isoTime?: string): string {
  if (!isoTime) return '';
  const [hours, minutes] = isoTime.split(':');
  const hour = Number(hours);
  if (Number.isNaN(hour)) return isoTime;
  const suffix = hour >= 12 ? 'PM' : 'AM';
  return `${hour % 12 || 12}:${minutes ?? '00'} ${suffix}`;
}

const WEEKDAY_SHORT = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export function mapEduOSStudentExams(raw: unknown): StudentExamsData {
  const root = asRecord(raw);
  const hub = asRecord(root.hub ?? raw);
  const upcoming = asArray<Record<string, unknown>>(hub.upcomingExams);
  const results = asArray<Record<string, unknown>>(hub.publishedResults);

  const upcomingExams = upcoming.map((exam, index) => {
    const dateIso = text(exam.date ?? exam.examDate ?? exam.startAt ?? exam.publishedAt);
    const date = dateIso ? new Date(dateIso) : null;
    return {
      id: text(exam.id ?? exam.examSlotId, `exam-${index}`),
      monthShort:
        date && !Number.isNaN(date.getTime())
          ? date.toLocaleString('en-US', { month: 'short' }).toUpperCase()
          : 'TBD',
      dayNumber: date && !Number.isNaN(date.getTime()) ? date.getDate() : index + 1,
      subject: text(exam.subjectName ?? exam.examLabel ?? exam.examName ?? exam.title, 'Exam'),
      detailsLabel: text(exam.examLabel ?? exam.details ?? exam.roomName ?? exam.remark, ''),
    };
  });

  const resultItems = results.map((item, index) => ({
    id: text(item.examSlotId ?? item.id, `result-${index}`),
    subject: text(item.subjectName ?? item.title, 'Subject'),
    examLabel: text(item.examLabel ?? item.examName, 'Exam'),
    percent: num(item.percent ?? item.marksPercent),
    publishedAt: text(item.publishedAt),
    remark: text(item.remark),
  }));

  const average =
    resultItems.length > 0
      ? Math.round(resultItems.reduce((sum, item) => sum + item.percent, 0) / resultItems.length)
      : 0;
  const latest = resultItems[0];
  const next = upcoming[0] ?? {};

  return {
    scheduleTabLabel: 'Schedule',
    resultsTabLabel: 'Results',
    upcomingExamsTitle: 'Upcoming exams',
    hallTicketLabel: hub.hallTicketAvailable ? 'Hall ticket available' : 'Hall ticket not available',
    featuredExam: {
      trendsTitle: 'Published scores',
      growthLabel: latest ? latest.examLabel : 'No published results',
      trendBars: resultItems.slice(0, 6).map((item) => ({
        id: item.id,
        heightPercent: Math.max(4, Math.min(100, item.percent)),
        hoverLabel: `${item.subject}: ${item.percent}%`,
      })),
      yourScoreLabel: latest ? latest.subject : 'Your score',
      yourScoreValue: latest ? `${latest.percent}%` : '—',
      classAvgLabel: 'Your average',
      classAvgValue: resultItems.length ? `${average}%` : '—',
      nextPaperBadge: upcoming.length ? 'Next paper' : 'Results',
      nextPaperTitle: upcoming.length
        ? text(next.subjectName ?? next.examLabel ?? next.title, 'Upcoming exam')
        : latest
          ? `${latest.subject} · ${latest.percent}%`
          : 'No exam data',
      dateLabel: upcoming.length
        ? formatDateLabel(text(next.date ?? next.startAt))
        : formatDateLabel(latest?.publishedAt),
      locationLabel: upcoming.length
        ? text(next.roomName ?? next.location, '')
        : text(latest?.remark, ''),
    },
    upcomingExams,
    results: {
      overviewTitle: 'Overview',
      breakdownTitle: 'Published results',
      units: [
        {
          id: 'published',
          label: text(latest?.examLabel, 'Results'),
          overview: {
            averagePercent: average,
            accentPercent: latest?.percent ?? 0,
            averageLabel: 'Average',
            barStats: resultItems.map((item) => ({
              id: item.id,
              shortLabel: item.subject.slice(0, 3).toUpperCase(),
              percent: item.percent,
              variant: item.percent < 40 ? 'accent' : 'primary',
            })),
            barCaption: resultItems.length
              ? `${resultItems.length} published result(s) from EduOS`
              : 'No published results in EduOS yet',
          },
          breakdown: resultItems.length
            ? resultItems.map((item) => ({
                id: item.id,
                subject: `${item.subject} · ${item.percent}%`,
                sparklinePath: 'M0 20 L20 12 L40 16 L60 8 L80 14',
                sparklineFillPath: 'M0 24 L20 12 L40 16 L60 8 L80 14 L80 24 Z',
                strokeColor: item.percent < 40 ? '#DC2626' : '#0F766E',
                fillColor:
                  item.percent < 40 ? 'rgba(220,38,38,0.12)' : 'rgba(15,118,110,0.12)',
              }))
            : [
                {
                  id: 'empty',
                  subject: 'No published results',
                  sparklinePath: 'M0 20 L80 20',
                  sparklineFillPath: 'M0 24 L80 24 Z',
                  strokeColor: '#94A3B8',
                  fillColor: 'rgba(148,163,184,0.12)',
                  pendingMessage: 'EduOS has no published results for this student yet',
                  dimmed: true,
                },
              ],
        },
      ],
    },
  };
}

export function mapEduOSStudentFees(raw: unknown): StudentFeesData {
  const root = asRecord(raw);
  const ledger = asRecord(root.ledger);
  const payments = asArray<Record<string, unknown>>(root.payments);
  const schedule = asArray<Record<string, unknown>>(root.installmentSchedule);

  const totalDue = moneyAmount(ledger.totalDue ?? ledger.grossDue ?? ledger.netPayable);
  const paid = moneyAmount(ledger.paid);
  const balance = moneyAmount(ledger.balance);
  const paidPercent = totalDue > 0 ? Math.round((paid / totalDue) * 100) : paid > 0 ? 100 : 0;
  const nextInstallment = schedule[0] ?? {};
  const nextDueDate = text(ledger.nextDueDate ?? nextInstallment.dueDate ?? nextInstallment.date);

  return {
    banner: {
      badgeLabel: text(root.institutionType, 'Fees').toUpperCase(),
      sessionTitle: nextDueDate
        ? `Next due ${formatDateLabel(nextDueDate)}`
        : ledger.isOverdue
          ? 'Overdue balance'
          : 'Fee ledger',
    },
    balanceSummary: {
      paidPercent,
      paidLabel: 'Paid',
      progressLabel: `${paidPercent}% paid`,
      totalDueLabel: 'Total due',
      totalDueAmount: formatInr(totalDue),
      balanceDueLabel: 'Balance due',
      balanceDueAmount: formatInr(balance),
    },
    balanceDetailsTitle: 'Balance details',
    balanceDetail: {
      paidAmountLabel: 'Amount paid',
      paidAmount: formatInr(paid),
      nextInstallmentLabel: 'Next due date',
      nextInstallmentDate: formatDateLabel(nextDueDate) || '—',
    },
    quickPay: {
      title: 'Quick pay',
      amountLabel: 'Amount',
      defaultAmount: balance,
      currencyLabel: 'INR',
      payNowLabel: 'Pay now',
      secureLabel: text(root.razorpayKeyId) ? 'Razorpay enabled' : 'Online pay unavailable',
    },
    paymentHistoryTitle: 'Payment history',
    viewAllLabel: 'View all',
    transactions: payments.map((payment, index) => {
      let amount = moneyAmount(payment.amount);
      if (!amount && typeof payment.amountPaise === 'number') {
        amount = Number(payment.amountPaise) / 100;
      }
      return {
        id: text(payment.id, `pay-${index}`),
        date: formatDateLabel(text(payment.paidAt ?? payment.date ?? payment.createdAt)),
        status: 'success' as const,
        statusLabel: text(payment.status, 'Paid'),
        transactionId: text(
          payment.receiptNo ?? payment.transactionId ?? payment.id,
          `TXN-${index + 1}`,
        ),
        amount: formatInr(amount),
      };
    }),
    support: {
      message: payments.length
        ? `${payments.length} payment(s) on record`
        : 'No fee payments recorded in EduOS yet',
      buttonLabel: 'Accounts office',
    },
  };
}

export function mapEduOSStudentLeave(raw: unknown): StudentLeaveData {
  const root = asRecord(raw);
  const requests = asArray<Record<string, unknown>>(root.requests ?? raw);

  const mapped = requests.map((item, index) => {
    const statusRaw = text(item.status, 'pending').toLowerCase();
    const status =
      statusRaw === 'approved' || statusRaw === 'rejected' || statusRaw === 'pending'
        ? statusRaw
        : 'pending';
    const fromDate = text(item.fromDate);
    const toDate = text(item.toDate);
    return {
      id: text(item.id, `leave-${index}`),
      dateRange:
        fromDate && toDate
          ? `${formatDateLabel(fromDate)} – ${formatDateLabel(toDate)}`
          : formatDateLabel(fromDate || toDate),
      durationLabel: text(item.durationLabel, ''),
      leaveType: text(item.leaveType ?? item.category, 'Leave'),
      reason: text(item.reason, ''),
      status: status as 'pending' | 'approved' | 'rejected',
      statusLabel: status.charAt(0).toUpperCase() + status.slice(1),
    };
  });

  const approved = mapped.filter((item) => item.status === 'approved').length;
  const pending = mapped.filter((item) => item.status === 'pending').length;
  const rejected = mapped.filter((item) => item.status === 'rejected').length;

  return {
    title: 'Leave requests',
    description: mapped.length
      ? `${mapped.length} request(s) from EduOS`
      : 'No leave requests in EduOS yet',
    leaveTypes: [],
    formSubmitLabel: 'Submit request',
    requestsTitle: 'Your requests',
    viewAllLabel: 'View all',
    tableHeaders: {
      dates: 'Dates',
      typeReason: 'Type / reason',
      status: 'Status',
    },
    requests: mapped,
    stats: {
      remainingCount: pending,
      remainingLabel: 'Pending',
      availedCount: approved,
      availedLabel: rejected ? `${approved} approved · ${rejected} rejected` : 'Approved',
    },
  };
}

export function mapEduOSStudentAlerts(raw: unknown): StudentAlertsData {
  const root = asRecord(raw);
  const announcements = asArray<Record<string, unknown>>(root.announcements ?? raw);
  const unreadCount = num(
    root.unreadCount,
    announcements.filter((item) => item.read === false).length,
  );

  return {
    title: 'Alerts',
    description: announcements.length
      ? `${announcements.length} announcement(s) from EduOS`
      : 'No announcements in EduOS yet',
    unreadLabel: unreadCount ? `${unreadCount} unread` : '0 unread',
    pings: announcements.map((item, index) => ({
      id: text(item.id, `alert-${index}`),
      type: item.read === false ? 'urgent' : 'info',
      typeLabel: item.read === false ? 'Unread' : 'Update',
      dateLabel: formatDateLabel(text(item.sentAt ?? item.createdAt)),
      title: text(item.title, 'Announcement'),
      message: text(item.body ?? item.message, ''),
      ctaLabel: 'Open',
      unread: item.read === false,
    })),
    loadMoreLabel: 'Load more',
  };
}

export function mapEduOSStudentNotices(raw: unknown): StudentNoticesData {
  const root = asRecord(raw);
  const announcements = asArray<Record<string, unknown>>(root.announcements ?? raw);

  return {
    title: 'Notices',
    description: announcements.length
      ? `${announcements.length} notice(s) from EduOS`
      : 'No notices in EduOS yet',
    categories: [{ id: 'all', label: 'All' }],
    notices: announcements.map((item, index) => ({
      id: text(item.id, `notice-${index}`),
      category: 'academic',
      categoryLabel: text(item.targetLabel ?? item.scope, 'General'),
      dateLabel: formatDateLabel(text(item.sentAt ?? item.createdAt)),
      title: text(item.title, 'Notice'),
      excerpt: text(item.body ?? item.message, '').slice(0, 140),
      variant: 'standard',
      ctaLabel: 'Read more',
    })),
    loadMoreLabel: 'Load more',
  };
}

export function mapEduOSStudentProfile(raw: unknown): StudentProfileData {
  const root = asRecord(raw);
  const name = text(root.name, 'Student');
  const roll = text(root.rollNumber ?? root.customLoginId, '');
  const phone = text(root.phone ?? root.ownPhone);
  const classLabel = text(root.classLabel, '');
  const editable = asArray<string>(root.editableFields);

  return {
    name,
    rollLabel: roll,
    programBadge: classLabel,
    avatarUrl: '',
    personalSectionTitle: 'Personal details',
    personalFields: (
      [
        { id: 'name', label: 'Full name', value: name, inputType: 'text' as const },
        { id: 'roll', label: 'Roll / admission no.', value: roll, inputType: 'text' as const },
        { id: 'phone', label: 'Phone', value: phone, inputType: 'tel' as const },
        { id: 'class', label: 'Class', value: classLabel, inputType: 'text' as const },
      ] as const
    ).filter(
      (field) =>
        field.value || editable.includes(field.id) || editable.includes('ownPhone'),
    ),
    securitySectionTitle: 'Account',
    securityItems: [],
    saveLabel: 'Save changes',
    lastUpdatedLabel: `User ID ${text(root.userId).slice(0, 8)}…`,
  };
}

export function mapEduOSStudentTimetable(raw: unknown): StudentTimetableData {
  const root = asRecord(raw);
  const daysRaw = asArray<Record<string, unknown>>(root.days);
  const today = new Date();
  const todayIsoWeekday = ((today.getDay() + 6) % 7) + 1;

  const dayOptions = daysRaw.map((day, index) => {
    const dayOfWeek = num(day.dayOfWeek, index + 1);
    return {
      id: String(dayOfWeek),
      weekdayShort: text(day.label, WEEKDAY_SHORT[dayOfWeek - 1] ?? `D${dayOfWeek}`)
        .slice(0, 3)
        .toUpperCase(),
      dayNumber: dayOfWeek,
      periods: asArray<Record<string, unknown>>(day.periods),
    };
  });

  const dailySlotsByDay: StudentTimetableData['dailySlotsByDay'] = {};
  for (const day of dayOptions) {
    dailySlotsByDay[day.id] = day.periods.map((period, index) => ({
      id: text(period.id, `${day.id}-${index}`),
      kind: 'class' as const,
      startTime: formatTime(text(period.startTime)),
      durationLabel: text(period.endTime) ? `Until ${formatTime(text(period.endTime))}` : undefined,
      subject: text(period.subjectName, 'Class'),
      category: 'core' as const,
      categoryLabel: 'Core',
      location: text(period.roomName, ''),
      locationIcon: 'location' as const,
      facultyName: text(period.facultyName),
      isActive: false,
    }));
  }

  const selectedDayId = String(
    dayOptions.find((day) => day.id === String(todayIsoWeekday))?.id ?? dayOptions[0]?.id ?? '',
  );

  const weeklyDayHeaders = dayOptions.map((day) => day.weekdayShort);
  const maxPeriods = Math.max(0, ...dayOptions.map((day) => day.periods.length));
  const weeklyRows = Array.from({ length: maxPeriods }, (_, rowIndex) => {
    const firstPeriod = dayOptions.find((day) => day.periods[rowIndex])?.periods[rowIndex];
    return {
      timeLabel: formatTime(text(firstPeriod?.startTime)) || `P${rowIndex + 1}`,
      cells: dayOptions.map((day) => {
        const period = day.periods[rowIndex];
        if (!period) return null;
        const subject = text(period.subjectName, '—');
        return {
          code: subject.slice(0, 3).toUpperCase(),
          category: 'core' as const,
        };
      }),
    };
  });

  return {
    title: dayOptions.length ? 'Timetable' : 'No timetable in EduOS yet',
    days: dayOptions.map(({ id, weekdayShort, dayNumber }) => ({ id, weekdayShort, dayNumber })),
    selectedDayId,
    dailySlotsByDay,
    showNowIndicator: dayOptions.length > 0,
    nowIndicatorLabel: 'Now',
    weeklyDayHeaders,
    weeklyRows,
    legendTitle: 'Legend',
    legend: dayOptions.length ? [{ id: 'core', label: 'Core', category: 'core' }] : [],
  };
}

export function mapEduOSStudentLearn(raw: unknown, assignmentsRaw?: unknown): StudentLearnData {
  const root = asRecord(raw);
  const folders = asArray<Record<string, unknown>>(root.folders);
  const general = asArray<Record<string, unknown>>(root.general);
  const materials: Record<string, unknown>[] = [
    ...folders.flatMap((folder) =>
      asArray<Record<string, unknown>>(folder.materials ?? folder.items).map((item) => ({
        ...item,
        folderName: text(folder.name ?? folder.folderName, 'Folder'),
      })),
    ),
    ...general,
  ];

  const assignmentRoot = asRecord(assignmentsRaw);
  const assignments = asArray<Record<string, unknown>>(assignmentRoot.assignments);
  const submissions = asArray<Record<string, unknown>>(assignmentRoot.submissions);
  const submissionByAssignment = new Map(
    submissions.map((item) => [text(item.assignmentId), item]),
  );

  const categories = [
    { id: 'all', label: 'All' },
    ...folders.map((folder, index) => ({
      id: text(folder.id, `folder-${index}`),
      label: text(folder.name ?? folder.folderName, `Folder ${index + 1}`),
    })),
  ];

  const recentMaterials = materials.map((item, index) => ({
    id: text(item.id, `material-${index}`),
    title: text(item.fileName ?? item.title ?? item.name, 'Study material'),
    fileType: text(item.fileName).toLowerCase().endsWith('.pdf') ? ('pdf' as const) : ('doc' as const),
    sizeLabel: text(item.sizeLabel, ''),
    updatedLabel: formatDateLabel(text(item.uploadedAt ?? item.updatedAt)) || '',
  }));

  const firstMaterial = recentMaterials[0];

  return {
    searchPlaceholder: 'Search materials',
    studyTabLabel: 'Study',
    assignmentsTabLabel: 'Assignments',
    assignmentsDescription: assignments.length
      ? `${assignments.length} assignment(s) from EduOS`
      : 'No assignments in EduOS yet',
    categories,
    selectedCategoryId: 'all',
    heroMaterial: {
      id: firstMaterial?.id ?? 'empty',
      badgeLabel: materials.length ? 'Latest' : 'Empty',
      title: firstMaterial?.title ?? 'No study materials in EduOS yet',
      subtitle: firstMaterial?.updatedLabel ?? '',
      imageUrl: '',
    },
    recentMaterialsTitle: 'Materials',
    viewAllLabel: 'View all',
    recentMaterials,
    uploadAssignments: assignments.map((item, index) => {
      const submission = submissionByAssignment.get(text(item.id));
      const submitted = Boolean(submission);
      const submissionStatus = text(submission?.submissionStatus).toLowerCase();
      return {
        id: text(item.id, `assignment-${index}`),
        status: submitted ? ('submitted' as const) : ('pending' as const),
        title: text(item.title, 'Assignment'),
        subject: text(item.subjectName ?? item.classLabel, ''),
        dueLabel: formatDateLabel(text(item.dueAt)) || '',
        dueIcon: 'calendar' as const,
        description: [
          text(item.description, ''),
          submissionStatus === 'graded' && submission?.gradedMarks != null
            ? `Graded: ${num(submission.gradedMarks)}`
            : '',
        ]
          .filter(Boolean)
          .join(' · '),
        filePlaceholder: 'Choose PDF or DOC',
        uploadLabel: submitted ? 'Resubmit' : 'Upload',
        submittedAtLabel: submission
          ? formatDateLabel(text(submission.submittedAt))
          : undefined,
        submittedFileName: text(submission?.attachmentName) || undefined,
        viewSubmissionLabel: submitted ? 'View submission' : undefined,
      };
    }),
  };
}

export function mapEduOSStudentAttendance(raw: unknown): AttendanceRecord[] {
  const root = asRecord(raw);
  const subjects = asArray<Record<string, unknown>>(root.subjects);
  const overall = num(root.overallPercent);
  const threshold = num(root.threshold, 75);
  const totalSessions = num(root.totalSessions);

  const rows: AttendanceRecord[] = [
    {
      id: text(root.studentId, 'overall'),
      date: new Date().toISOString().slice(0, 10),
      status: overall >= threshold ? 'present' : 'absent',
      subject: 'Overall',
      remarks: `${overall}% · ${totalSessions} sessions · threshold ${threshold}%`,
    },
  ];

  for (const [index, subject] of subjects.entries()) {
    rows.push({
      id: text(subject.subjectId ?? subject.id, `att-${index}`),
      date: text(subject.date, new Date().toISOString().slice(0, 10)),
      status:
        num(subject.percent ?? subject.attendancePercent) >= threshold ? 'present' : 'absent',
      subject: text(subject.subjectName ?? subject.name, 'Subject'),
      remarks: `${num(subject.percent ?? subject.attendancePercent)}% · ${num(subject.present ?? subject.presentCount)}/${num(subject.total ?? subject.totalSessions)} sessions`,
    });
  }

  return rows;
}

export function mapEduOSStudentHelpCenter(raw: unknown): StudentHelpCenterData {
  const root = asRecord(raw);
  const grievances = asArray<Record<string, unknown>>(root.grievances);

  return {
    title: 'Help & Support',
    description: grievances.length
      ? `${grievances.length} ticket(s) from EduOS`
      : 'No support tickets in EduOS yet',
    faqSectionTitle: 'Tickets',
    faqs: grievances.map((item, index) => ({
      id: text(item.id, `ticket-${index}`),
      question: text(item.subject, 'Support ticket'),
      answer: [
        text(item.status, 'open'),
        text(item.category),
        text(item.description),
        text(item.resolutionNote),
      ]
        .filter(Boolean)
        .join(' · '),
    })),
    contactSectionTitle: 'Details',
    contacts: [],
    quickLinksTitle: 'Open tickets',
    quickLinks: grievances
      .filter((item) => text(item.status).toLowerCase() !== 'resolved')
      .map((item, index) => ({
        id: text(item.id, `open-${index}`),
        label: text(item.subject, 'Ticket'),
        description: `${text(item.status, 'open')} · ${formatDateLabel(text(item.createdAt))}`,
      })),
    submitTicketLabel: 'Raise a ticket',
    submitTicketFootnote: 'Tickets are stored in EduOS grievances',
  };
}

export function mapEduOSStudentGrades(raw: unknown): Grade[] {
  const root = asRecord(raw);
  const hub = asRecord(root.hub ?? raw);
  const results = asArray<Record<string, unknown>>(hub.publishedResults ?? root.results);

  return results.map((item, index) => ({
    id: text(item.examSlotId ?? item.id, `grade-${index}`),
    subject: text(item.subjectName ?? item.title, 'Subject'),
    marks: num(item.percent ?? item.marks ?? item.score),
    maxMarks: 100,
    grade: text(item.remark ?? item.grade, String(num(item.percent))),
    examType: text(item.examLabel ?? item.examName ?? item.examType, 'Exam'),
    date:
      formatDateLabel(text(item.publishedAt ?? item.date ?? item.createdAt)) ||
      new Date().toISOString().slice(0, 10),
  }));
}

export function mapEduOSAnnouncements(raw: unknown): Announcement[] {
  const root = asRecord(raw);
  const announcements = asArray<Record<string, unknown>>(root.announcements ?? raw);

  return announcements.map((item, index) => ({
    id: text(item.id, `ann-${index}`),
    title: text(item.title, 'Announcement'),
    body: text(item.body ?? item.message, ''),
    author: text(item.createdBy ?? item.author, 'Admin'),
    createdAt: text(item.sentAt ?? item.createdAt, new Date().toISOString()),
    priority: item.read === false ? 'high' : 'medium',
    audience: ['student'],
  }));
}
