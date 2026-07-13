import type {
  Announcement,
  FacultyDashboardData,
  FacultyDashboardStats,
  InstitutionHoliday,
  TimetableSlot,
} from '@piiaura/types';

export interface FacultyDashboardResponse {
  stats: FacultyDashboardStats;
  data: FacultyDashboardData;
  announcements: Announcement[];
}

interface EduOSFacultyDashboardResponse {
  today?: string;
  schedule?: Array<{
    id?: string;
    classSectionId?: string;
    subjectId?: string;
    facultyUserId?: string;
    roomId?: string;
    dayOfWeek?: number;
    periodIndex?: number;
    startTime?: string;
    endTime?: string;
    status?: string;
    statusNote?: string | null;
    classLabel?: string;
    subjectName?: string;
    roomName?: string;
  }>;
  snapshot?: {
    sessionsToday?: number;
    sessionsCompleted?: number;
    pendingLeave?: number;
    announcementsCount?: number;
    attendanceMarkedPercent?: number;
    syllabusProgressPercent?: number;
  };
  alerts?: Array<{
    id?: string;
    title?: string;
    message?: string;
    severity?: string;
    href?: string;
    count?: number;
  }>;
  announcements?: Announcement[];
  upcomingHolidays?: Array<{
    id?: string;
    name?: string;
    date?: string;
    scope?: string;
    classIds?: string[];
    blocksAttendance?: boolean;
    createdAt?: string;
  }>;
}

function formatHolidayDate(isoDate: string): { month: string; day: string } {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return { month: '', day: '' };
  }
  return {
    month: date.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
    day: String(date.getDate()),
  };
}

function mapTodaySessions(
  schedule: EduOSFacultyDashboardResponse['schedule'],
): TimetableSlot[] {
  return (schedule ?? []).map((slot, index) => ({
    id: slot.id ?? `slot-${index}`,
    day: 'Today',
    subject: slot.subjectName ?? 'Subject',
    room: slot.roomName ?? 'Room',
    startTime: slot.startTime ?? '',
    endTime: slot.endTime ?? '',
    facultyName: '',
  }));
}

function mapHolidays(
  holidays: EduOSFacultyDashboardResponse['upcomingHolidays'],
): InstitutionHoliday[] {
  return (holidays ?? []).map((holiday, index) => {
    const { month, day } = formatHolidayDate(holiday.date ?? '');
    return {
      id: holiday.id ?? `holiday-${index}`,
      name: holiday.name ?? 'Holiday',
      month,
      day,
      scope: holiday.scope ?? 'institution',
      variant: index === 0 ? 'highlight' : 'default',
    };
  });
}

export function mapEduOSFacultyDashboard(
  raw: EduOSFacultyDashboardResponse,
): FacultyDashboardResponse {
  const snapshot = raw.snapshot ?? {};
  const sessionsToday = snapshot.sessionsToday ?? 0;
  const sessionsCompleted = snapshot.sessionsCompleted ?? 0;
  const pendingLeave = snapshot.pendingLeave ?? 0;
  const primaryAlert = raw.alerts?.[0];

  const data: FacultyDashboardData = {
    attendanceSummary: {
      markedPercentage: snapshot.attendanceMarkedPercent ?? 0,
      sessionsCompleted,
      sessionsTotal: sessionsToday,
    },
    pendingLeave,
    liveAttendancePercent: snapshot.attendanceMarkedPercent ?? 0,
    pendingTasks: (raw.alerts ?? []).map((alert, index) => ({
      id: alert.id ?? `alert-${index}`,
      title: alert.title ?? 'Alert',
      description: alert.message ?? '',
      count: alert.count ?? 0,
      accentColor: alert.severity === 'warning' ? '#F59E0B' : '#2563EB',
    })),
    holidays: mapHolidays(raw.upcomingHolidays),
    teachingProgress: snapshot.syllabusProgressPercent ?? 0,
    alert: primaryAlert
      ? {
          id: primaryAlert.id ?? 'primary-alert',
          message: primaryAlert.message ?? primaryAlert.title ?? 'Action required',
          count: primaryAlert.count ?? 0,
          actionLabel: 'View',
        }
      : null,
    todaySessions: mapTodaySessions(raw.schedule),
  };

  const stats: FacultyDashboardStats = {
    totalStudents: 0,
    classesToday: sessionsToday,
    pendingAssignments: pendingLeave,
    attendanceRate: snapshot.attendanceMarkedPercent ?? 0,
  };

  return {
    stats,
    data,
    announcements: raw.announcements ?? [],
  };
}
