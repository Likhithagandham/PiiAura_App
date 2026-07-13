import type { StudentDashboardData } from '@piiaura/types';

export interface EduOSStudentDashboardResponse {
  institutionType?: string;
  profile?: {
    studentId?: string;
    name?: string;
    classLabel?: string;
    className?: string;
    sectionName?: string;
    classSectionId?: string;
    rollNumber?: string;
  };
  attendancePercent?: number;
  attendanceThreshold?: number;
  attendanceAlert?: {
    level?: string;
    message?: string;
    attendancePercent?: number;
    thresholdPercent?: number;
  } | null;
  feeAlert?: {
    message?: string;
    amountDue?: number;
  } | null;
  scheduleToday?: Array<{
    subjectName?: string;
    startTime?: string;
    endTime?: string;
    roomName?: string;
    dayLabel?: string;
  }>;
  upcomingExamsCount?: number;
  nextExamLabel?: string | null;
  hallTicketAvailable?: boolean;
  announcements?: unknown[];
}

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

function formatTime(isoTime: string): string {
  if (!isoTime) return '';
  const [hours, minutes] = isoTime.split(':');
  const hour = Number(hours);
  if (Number.isNaN(hour)) return isoTime;
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const normalized = hour % 12 || 12;
  return `${normalized}:${minutes} ${suffix}`;
}

export function mapEduOSStudentDashboard(
  raw: EduOSStudentDashboardResponse,
): StudentDashboardData {
  const profile = raw.profile;
  const schedule = raw.scheduleToday ?? [];
  const firstSchedule = schedule[0];
  const upcomingCount = raw.upcomingExamsCount ?? 0;
  const nextExam = raw.nextExamLabel?.trim();

  return {
    welcomeName: profile?.name ?? 'Student',
    portalLabel: profile?.classLabel ?? 'Student Portal',
    avatarUrl: '',
    feeAlert: raw.feeAlert
      ? {
          amountLabel: formatCurrency(raw.feeAlert.amountDue ?? 0),
          detailsLabel: raw.feeAlert.message ?? 'Fee balance due',
          payNowLabel: 'Pay Now',
        }
      : {
          amountLabel: '',
          detailsLabel: '',
          payNowLabel: 'Pay Now',
        },
    attendance: {
      label: 'Attendance',
      percent: raw.attendancePercent ?? 0,
    },
    hallTicket: {
      label: 'Hall Ticket',
      status: raw.hallTicketAvailable ? 'Available' : 'Not available',
      badgeLabel: raw.hallTicketAvailable ? 'Ready' : undefined,
    },
    assignments: {
      label: 'Assignments',
      count: 0,
      countLabel: 'pending',
    },
    upcomingExamsTitle: 'Upcoming Exams',
    upcomingExamsCount: upcomingCount,
    featuredExam: {
      id: 'next-exam',
      subject: nextExam || (upcomingCount > 0 ? 'Upcoming exam' : 'No exams scheduled'),
      dateTimeLabel: upcomingCount > 0 ? 'See exams for details' : '',
      iconLetter: (nextExam?.[0] ?? 'E').toUpperCase(),
    },
    nextExamLabel: nextExam || (upcomingCount > 0 ? 'View exam schedule' : 'No upcoming exams'),
    todayScheduleTitle: "Today's Schedule",
    todayScheduleEmpty: schedule.length
      ? {
          title: firstSchedule?.subjectName ?? 'Class',
          subtitle: firstSchedule
            ? `${formatTime(firstSchedule.startTime ?? '')} · ${firstSchedule.roomName ?? 'Room TBD'}`
            : 'Classes scheduled for today',
        }
      : {
          title: 'No classes today',
          subtitle: 'Your schedule is clear for today',
        },
    announcementsTitle: 'Announcements',
    announcementsEmpty: {
      title:
        (raw.announcements?.length ?? 0) > 0
          ? `${raw.announcements?.length} announcement(s)`
          : 'No announcements',
      subtitle:
        (raw.announcements?.length ?? 0) > 0
          ? 'Open the alerts tab for details'
          : 'Check back later for updates',
    },
  };
}
