export type Role = 'faculty' | 'student' | 'parent' | 'admin' | 'superadmin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatarUrl?: string;
  department?: string;
  className?: string;
  rollNumber?: string;
  employeeCode?: string;
  admissionNumber?: string;
  phone?: string;
}

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded' | 'overdue';
  maxMarks?: number;
  obtainedMarks?: number;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  subject?: string;
  remarks?: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  author: string;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
  audience: Role[];
}

export interface Grade {
  id: string;
  subject: string;
  examType: string;
  marks: number;
  maxMarks: number;
  grade: string;
  date: string;
}

export interface TimetableSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  subject: string;
  room: string;
  facultyName: string;
}

export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  className: string;
  avatarUrl?: string;
  attendancePercentage: number;
}

export interface FacultyAttendanceStudent {
  id: string;
  name: string;
  rollNumber: string;
}

export interface FacultyAttendanceSession {
  id: string;
  title: string;
  subtitle: string;
  periodLabel: string;
  totalStudents: number;
  students: FacultyAttendanceStudent[];
}

export type FacultyDayAttendanceStatus = 'present' | 'absent' | 'leave' | 'holiday' | 'not_marked';

export interface FacultyAttendanceOverview {
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  attendancePercent: number;
  monthLabel: string; // e.g. "June 2026"
}

export interface FacultyCalendarDay {
  date: string; // ISO date
  dayNumber: number;
  status: FacultyDayAttendanceStatus;
  isInCurrentMonth: boolean;
}

export interface FacultyCalendarMonth {
  monthLabel: string; // e.g. "June 2026"
  daysOfWeek: string[]; // Sun..Sat
  days: FacultyCalendarDay[]; // includes leading/trailing days for grid
  selectedDate: string; // ISO date
}

export interface FacultyWeeklyTimetableSlot {
  id: string;
  time: string; // e.g. "09:00"
  dayLabel: string; // e.g. "MON • BCS III"
  title: string;
  room: string;
  duration?: string; // e.g. "50m"
  emphasized?: boolean;
  isActive?: boolean; // shows "NOW" badge
}

export interface FacultyWeeklyTimetableWeek {
  weekNumber: number;
  slots: FacultyWeeklyTimetableSlot[];
}

export interface FacultyWeeklyTimetable {
  title: string; // "Teaching Schedule"
  semesterLabel: string; // e.g. "Academic Semester"
  weeks: FacultyWeeklyTimetableWeek[];
  defaultWeekIndex?: number;
}

export interface FacultyScheduleData {
  heading: string; // "My Timetable"
  description: string;
  alertCount: number;
  attendanceOverview: FacultyAttendanceOverview;
  /** Attendance status keyed by ISO date (YYYY-MM-DD). */
  attendanceByDate: Record<string, FacultyDayAttendanceStatus>;
  /** Initial month shown in calendar view (month is 0-indexed). */
  calendarAnchor: { year: number; month: number };
  weekly: FacultyWeeklyTimetable;
}

export interface FacultyDashboardStats {
  totalStudents: number;
  classesToday: number;
  pendingAssignments: number;
  attendanceRate: number;
}

export interface FacultyAttendanceSummary {
  markedPercentage: number;
  sessionsCompleted: number;
  sessionsTotal: number;
}

export interface FacultyDashboardAlert {
  id: string;
  message: string;
  count: number;
  actionLabel: string;
}

export interface FacultyPendingTask {
  id: string;
  title: string;
  description: string;
  count: number;
  accentColor: string;
}

export interface InstitutionHoliday {
  id: string;
  name: string;
  month: string;
  day: string;
  scope: string;
  variant: 'highlight' | 'default';
}

export interface FacultyDashboardData {
  attendanceSummary: FacultyAttendanceSummary;
  pendingLeave: number;
  liveAttendancePercent: number;
  pendingTasks: FacultyPendingTask[];
  holidays: InstitutionHoliday[];
  teachingProgress: number;
  alert: FacultyDashboardAlert | null;
  todaySessions: TimetableSlot[];
}

export interface StudentDashboardStats {
  attendancePercentage: number;
  pendingAssignments: number;
  upcomingExams: number;
  averageGrade: string;
}

export type FacultyLeaveRequestStatus = 'approved' | 'pending' | 'completed' | 'rejected';

export interface FacultyLeaveBalance {
  id: string;
  label: string;
  used: number;
  total: number;
  icon: 'calendar' | 'medical';
}

export interface FacultyLeaveRequest {
  id: string;
  leaveType: string;
  dateRangeLabel: string;
  status: FacultyLeaveRequestStatus;
  metaLabel: string;
}

export interface FacultyLeaveData {
  title: string;
  description: string;
  balances: FacultyLeaveBalance[];
  leaveTypes: string[];
  recentRequests: FacultyLeaveRequest[];
}
