import type {
  FacultyAttendanceOverview,
  FacultyCalendarDay,
  FacultyCalendarMonth,
  FacultyDayAttendanceStatus,
} from '@piiaura/types';

export const CALENDAR_DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export const ATTENDANCE_STATUS_LABELS: Record<FacultyDayAttendanceStatus, string> = {
  present: 'Present',
  absent: 'Absent',
  leave: 'Leave',
  holiday: 'Holiday',
  not_marked: 'Not marked',
};

export function toISODate(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

export function parseISODate(isoDate: string): { year: number; month: number; day: number } {
  const [year, month, day] = isoDate.split('-').map(Number);
  return { year, month: month - 1, day };
}

export function formatMonthLabel(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

export function formatSelectedDayLabel(isoDate: string): string {
  const { year, month, day } = parseISODate(isoDate);
  return new Date(year, month, day).toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function resolveDayStatus(
  isoDate: string,
  statusMap: Record<string, FacultyDayAttendanceStatus>,
): FacultyDayAttendanceStatus {
  if (statusMap[isoDate]) {
    return statusMap[isoDate];
  }
  return 'not_marked';
}

function addTrailingDays(
  days: FacultyCalendarDay[],
  year: number,
  month: number,
  statusMap: Record<string, FacultyDayAttendanceStatus>,
): void {
  let nextYear = year;
  let nextMonth = month + 1;
  if (nextMonth > 11) {
    nextMonth = 0;
    nextYear += 1;
  }

  let dayNum = 1;
  while (days.length < 42) {
    const date = toISODate(nextYear, nextMonth, dayNum);
    days.push({
      date,
      dayNumber: dayNum,
      status: resolveDayStatus(date, statusMap),
      isInCurrentMonth: false,
    });
    dayNum += 1;
  }
}

export function buildCalendarMonth(
  year: number,
  month: number,
  statusMap: Record<string, FacultyDayAttendanceStatus>,
  selectedDate?: string,
): FacultyCalendarMonth {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = firstDay.getDay();
  const days: FacultyCalendarDay[] = [];

  const prevMonthLast = new Date(year, month, 0).getDate();
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;

  for (let i = startWeekday - 1; i >= 0; i -= 1) {
    const dayNum = prevMonthLast - i;
    const date = toISODate(prevYear, prevMonth, dayNum);
    days.push({
      date,
      dayNumber: dayNum,
      status: resolveDayStatus(date, statusMap),
      isInCurrentMonth: false,
    });
  }

  for (let dayNum = 1; dayNum <= daysInMonth; dayNum += 1) {
    const date = toISODate(year, month, dayNum);
    days.push({
      date,
      dayNumber: dayNum,
      status: resolveDayStatus(date, statusMap),
      isInCurrentMonth: true,
    });
  }

  addTrailingDays(days, year, month, statusMap);

  const defaultSelected = toISODate(year, month, Math.min(25, daysInMonth));

  return {
    monthLabel: formatMonthLabel(year, month),
    daysOfWeek: [...CALENDAR_DAYS_OF_WEEK],
    days,
    selectedDate: selectedDate ?? defaultSelected,
  };
}

export function shiftMonth(
  year: number,
  month: number,
  delta: number,
): { year: number; month: number } {
  const date = new Date(year, month + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() };
}

export function isDateInMonth(isoDate: string, year: number, month: number): boolean {
  const parsed = parseISODate(isoDate);
  return parsed.year === year && parsed.month === month;
}

export function clampSelectedDateToMonth(
  selectedDate: string,
  year: number,
  month: number,
): string {
  if (isDateInMonth(selectedDate, year, month)) {
    return selectedDate;
  }
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return toISODate(year, month, daysInMonth);
}

export function computeAttendanceOverview(
  year: number,
  month: number,
  statusMap: Record<string, FacultyDayAttendanceStatus>,
): FacultyAttendanceOverview {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let presentDays = 0;
  let absentDays = 0;
  let leaveDays = 0;

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = toISODate(year, month, day);
    const status = statusMap[date];
    if (status === 'present') presentDays += 1;
    else if (status === 'absent') absentDays += 1;
    else if (status === 'leave') leaveDays += 1;
  }

  const markedDays = presentDays + absentDays + leaveDays;
  const attendancePercent =
    markedDays > 0 ? Math.round((presentDays / markedDays) * 100) : 0;

  return {
    presentDays,
    absentDays,
    leaveDays,
    attendancePercent,
    monthLabel: formatMonthLabel(year, month),
  };
}

export function chunkWeeks(days: FacultyCalendarDay[]): FacultyCalendarDay[][] {
  const weeks: FacultyCalendarDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}
