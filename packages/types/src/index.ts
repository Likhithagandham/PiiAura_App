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
  studentLeave: FacultyStudentLeaveData;
}

export interface FacultyStudentLeavePending {
  id: string;
  studentName: string;
  classLabel: string;
  dateLabel: string;
  reason: string;
  appliedBy: string;
}

export interface FacultyStudentLeaveDecision {
  id: string;
  studentName: string;
  reviewedBy: string;
  status: 'approved' | 'rejected';
  timestampLabel: string;
}

export interface FacultyStudentLeaveData {
  pendingCount: number;
  pendingDescription: string;
  pendingRequests: FacultyStudentLeavePending[];
  recentDecisions: FacultyStudentLeaveDecision[];
}

export interface FacultyStudyMaterialTip {
  id: string;
  text: string;
  variant: 'info' | 'visibility';
}

export interface FacultyStudyMaterialData {
  title: string;
  description: string;
  sessions: string[];
  defaultSession: string;
  tips: FacultyStudyMaterialTip[];
  emptyUploadsTitle: string;
  emptyUploadsDescription: string;
}

export interface FacultyAssignmentItem {
  id: string;
  title: string;
  subject: string;
  className: string;
  dueLabel: string;
  submittedCount: number;
  totalStudents: number;
  accentColor: 'primary' | 'tertiary';
}

export interface FacultyAssignmentsData {
  title: string;
  description: string;
  classes: string[];
  subjects: string[];
  currentAssignments: FacultyAssignmentItem[];
  reviewEmptyTitle: string;
  reviewEmptyDescription: string;
  reviewRefreshLabel: string;
}

export type FacultyAiDifficulty = 'easy' | 'medium' | 'hard';

export interface FacultyAiQuestionType {
  id: string;
  label: string;
  description: string;
  defaultChecked: boolean;
}

export interface FacultyAiRecentGeneration {
  id: string;
  title: string;
  timeLabel: string;
  variant: 'secondary' | 'neutral';
}

export interface FacultyAiQuizRecentItem {
  id: string;
  title: string;
  metaLabel: string;
}

export interface FacultyAiEngagementBanner {
  eyebrow: string;
  title: string;
  imageUrl: string;
}

export interface FacultyAiTopicQuizData {
  title: string;
  description: string;
  subjects: string[];
  defaultSubject: string;
  defaultQuestionCount: string;
  timerOptions: string[];
  defaultTimer: string;
  defaultDifficulty: FacultyAiDifficulty;
  recentQuizzes: FacultyAiQuizRecentItem[];
  engagementBanner: FacultyAiEngagementBanner;
}

export interface FacultyAiToolsData {
  poweredByLabel: string;
  title: string;
  description: string;
  subjects: string[];
  defaultSubject: string;
  defaultDifficulty: FacultyAiDifficulty;
  questionTypes: FacultyAiQuestionType[];
  recentGenerations: FacultyAiRecentGeneration[];
  topicQuiz: FacultyAiTopicQuizData;
}

export interface FacultyMarksEntryStudent {
  id: string;
  index: number;
  name: string;
  rollNo: string;
  marks?: number;
}

export interface FacultyMarksEntryData {
  title: string;
  description: string;
  classes: string[];
  subjects: string[];
  examinations: string[];
  defaultClass: string;
  defaultSubject: string;
  defaultExamination: string;
  maxMarks: number;
  enrolledCount: number;
  students: FacultyMarksEntryStudent[];
  saveLabel: string;
}

export type FacultySyllabusStatus = 'pending-review' | 'on-track';

export interface FacultySyllabusFocus {
  subjectLabel: string;
  percent: number;
  nextChapter: string;
  updateTopicsLabel: string;
}

export interface FacultySyllabusChapter {
  id: string;
  title: string;
  status: 'completed' | 'current' | 'upcoming';
}

export interface FacultySyllabusSubject {
  id: string;
  name: string;
  classLabel: string;
  percent: number;
  status: FacultySyllabusStatus;
  statusLabel: string;
  lastUpdatedLabel: string;
  chapters: FacultySyllabusChapter[];
}

export interface FacultySyllabusAddOptions {
  subjectNames: string[];
  classLabels: string[];
}

export interface FacultySyllabusData {
  title: string;
  description: string;
  currentFocus: FacultySyllabusFocus;
  otherSubjectsLabel: string;
  subjects: FacultySyllabusSubject[];
  addSubjectLabel: string;
  addSubjectOptions: FacultySyllabusAddOptions;
}

export interface FacultyInvigilationDuty {
  id: string;
  examSlot: string;
  assignedBy: string;
  assignedByAuto: boolean;
  assignedAtLabel: string;
}

export interface FacultyInvigilationStat {
  id: string;
  label: string;
  value: string;
  variant: 'secondary' | 'neutral';
}

export interface FacultyInvigilationAlert {
  title: string;
  description: string;
  actionLabel: string;
}

export interface FacultyInvigilationData {
  title: string;
  description: string;
  scopeLabel: string;
  alert: FacultyInvigilationAlert;
  dutiesTitle: string;
  dutiesSubtitle: string;
  refreshLabel: string;
  duties: FacultyInvigilationDuty[];
  emptyDutiesMessage: string;
  stats: FacultyInvigilationStat[];
}

export interface FacultySalaryMonthOption {
  id: string;
  label: string;
}

export interface FacultySalaryDocument {
  id: string;
  title: string;
  subtitle: string;
  variant: 'form16' | 'pf';
  actions: ('download' | 'share')[];
}

export interface FacultySalaryPayrollError {
  title: string;
  descriptionTemplate: string;
  notifyLabel: string;
}

export interface FacultySalarySupport {
  title: string;
  description: string;
  actionLabel: string;
}

export interface FacultySalaryData {
  netPayableLabel: string;
  netPayableValue: string;
  lastProcessedLabel: string;
  lastProcessedValue: string;
  salarySlipTitle: string;
  historyLabel: string;
  monthLabel: string;
  months: FacultySalaryMonthOption[];
  defaultMonthId: string;
  payrollError: FacultySalaryPayrollError;
  documentsSectionTitle: string;
  documents: FacultySalaryDocument[];
  support: FacultySalarySupport;
}

export type FacultyAlertFilter = 'all' | 'academic' | 'administrative' | 'system';

export type FacultyAlertSeverity =
  | 'critical'
  | 'academic'
  | 'warning'
  | 'system'
  | 'update';

export type FacultyAlertCategory = 'academic' | 'administrative' | 'system';

export type FacultyAlertActionVariant = 'primary' | 'outline' | 'muted' | 'dismiss';

export interface FacultyAlertAction {
  id: string;
  label: string;
  variant: FacultyAlertActionVariant;
  route?: string;
}

export interface FacultyAlertItem {
  id: string;
  category: FacultyAlertCategory;
  severity: FacultyAlertSeverity;
  severityLabel: string;
  timeLabel: string;
  title: string;
  description: string;
  actions: FacultyAlertAction[];
  featured?: boolean;
}

export interface FacultyAlertsFilterOption {
  id: FacultyAlertFilter;
  label: string;
}

export interface FacultyAlertsData {
  sectionTitle: string;
  sectionDescription: string;
  markAllReadLabel: string;
  filters: FacultyAlertsFilterOption[];
  alerts: FacultyAlertItem[];
  emptyTitle: string;
  emptyDescription: string;
}

export interface FacultyProfileField {
  label: string;
  value: string;
  emphasized?: boolean;
}

export interface FacultyProfileInfoSection {
  id: string;
  title: string;
  fields: FacultyProfileField[];
}

export interface FacultyProfileBadge {
  id: string;
  label: string;
  variant: 'primary' | 'secondary';
}

export interface FacultyProfileAttendance {
  label: string;
  percent: number;
  periodLabel: string;
}

export interface FacultyProfileSettingItem {
  id: string;
  label: string;
}

export interface FacultyProfileData {
  name: string;
  designation: string;
  avatarUrl: string;
  verified: boolean;
  badges: FacultyProfileBadge[];
  personalInfo: FacultyProfileInfoSection;
  workInfo: FacultyProfileInfoSection;
  attendance: FacultyProfileAttendance;
  accountSettingsLabel: string;
  settings: FacultyProfileSettingItem[];
  logoutLabel: string;
}

export type FacultyNotificationPreferenceId = 'in-app' | 'sms' | 'email';

export interface FacultyNotificationPreference {
  id: FacultyNotificationPreferenceId;
  title: string;
  description: string;
  enabled: boolean;
}

export interface FacultySettingsData {
  name: string;
  subtitle: string;
  avatarUrl: string;
  headerAvatarUrl: string;
  employeeIdLabel: string;
  notificationsTitle: string;
  preferences: FacultyNotificationPreference[];
  saveLabel: string;
  saveFootnote: string;
  privacyTitle: string;
  privacyDescription: string;
}
