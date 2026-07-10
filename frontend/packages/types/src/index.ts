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

export interface StudentFeeAlert {
  amountLabel: string;
  detailsLabel: string;
  payNowLabel: string;
}

export interface StudentDashboardStatTile {
  label: string;
  percent?: number;
  badgeLabel?: string;
  status?: string;
  count?: number;
  countLabel?: string;
}

export interface StudentUpcomingExam {
  id: string;
  subject: string;
  dateTimeLabel: string;
  iconLetter: string;
}

export interface StudentDashboardEmptyState {
  title: string;
  subtitle: string;
}

export interface StudentDashboardData {
  welcomeName: string;
  portalLabel: string;
  avatarUrl: string;
  feeAlert: StudentFeeAlert;
  attendance: StudentDashboardStatTile;
  hallTicket: StudentDashboardStatTile;
  assignments: StudentDashboardStatTile;
  upcomingExamsTitle: string;
  upcomingExamsCount: number;
  featuredExam: StudentUpcomingExam;
  nextExamLabel: string;
  todayScheduleTitle: string;
  todayScheduleEmpty: StudentDashboardEmptyState;
  announcementsTitle: string;
  announcementsEmpty: StudentDashboardEmptyState;
}

export type StudentTimetableSlotCategory = 'core' | 'lab' | 'elective';

export interface StudentTimetableDayOption {
  id: string;
  weekdayShort: string;
  dayNumber: number;
}

export interface StudentTimetableDailySlot {
  id: string;
  kind: 'class' | 'break';
  startTime: string;
  durationLabel?: string;
  subject?: string;
  category?: StudentTimetableSlotCategory;
  categoryLabel?: string;
  location?: string;
  locationIcon?: 'location' | 'science' | 'room';
  facultyName?: string;
  facultyInitials?: string;
  isActive?: boolean;
  breakLabel?: string;
}

export interface StudentTimetableWeeklyCell {
  code: string;
  category: StudentTimetableSlotCategory;
}

export interface StudentTimetableWeeklyRow {
  timeLabel: string;
  cells: (StudentTimetableWeeklyCell | null)[];
}

export interface StudentTimetableLegendItem {
  id: string;
  label: string;
  category: StudentTimetableSlotCategory;
}

export interface StudentTimetableData {
  title: string;
  days: StudentTimetableDayOption[];
  selectedDayId: string;
  dailySlotsByDay: Record<string, StudentTimetableDailySlot[]>;
  showNowIndicator: boolean;
  nowIndicatorLabel: string;
  weeklyDayHeaders: string[];
  weeklyRows: StudentTimetableWeeklyRow[];
  legendTitle: string;
  legend: StudentTimetableLegendItem[];
}

export type StudentLearnMainTab = 'study' | 'assignments';
export type StudentLearnMaterialType = 'pdf' | 'doc';
export type StudentLearnAssignmentStatus = 'pending' | 'submitted';
export type StudentLearnAssignmentDueIcon = 'calendar' | 'event_available';

export interface StudentLearnCategory {
  id: string;
  label: string;
}

export interface StudentLearnHeroMaterial {
  id: string;
  badgeLabel: string;
  title: string;
  subtitle: string;
  imageUrl: string;
}

export interface StudentLearnMaterialItem {
  id: string;
  title: string;
  fileType: StudentLearnMaterialType;
  sizeLabel: string;
  updatedLabel: string;
}

export interface StudentLearnUploadAssignment {
  id: string;
  status: StudentLearnAssignmentStatus;
  title: string;
  subject: string;
  dueLabel: string;
  dueIcon: StudentLearnAssignmentDueIcon;
  description: string;
  selectedFileName?: string;
  filePlaceholder?: string;
  uploadLabel: string;
  submittedAtLabel?: string;
  submittedFileName?: string;
  viewSubmissionLabel?: string;
}

export interface StudentLearnData {
  searchPlaceholder: string;
  studyTabLabel: string;
  assignmentsTabLabel: string;
  assignmentsDescription: string;
  categories: StudentLearnCategory[];
  selectedCategoryId: string;
  heroMaterial: StudentLearnHeroMaterial;
  recentMaterialsTitle: string;
  viewAllLabel: string;
  recentMaterials: StudentLearnMaterialItem[];
  uploadAssignments: StudentLearnUploadAssignment[];
}

export interface StudentMoreHubTile {
  id: string;
  label: string;
  subtitle: string;
}

export interface StudentMoreSystemItem {
  id: string;
  label: string;
}

export interface StudentMoreData {
  heroTitle: string;
  heroDescription: string;
  academicSectionTitle: string;
  academicTiles: StudentMoreHubTile[];
  campusSectionTitle: string;
  campusTiles: StudentMoreHubTile[];
  systemSectionTitle: string;
  systemItems: StudentMoreSystemItem[];
}

export interface StudentHomeworkOverview {
  progressLabel: string;
  title: string;
  progressPercent: number;
  summaryLabel: string;
  pendingLabel: string;
  pendingValue: string;
  nextDueLabel: string;
  nextDueValue: string;
}

export interface StudentHomeworkDayOption {
  id: string;
  weekdayShort: string;
  dayNumber: number;
}

export type StudentHomeworkEntryKind = 'task' | 'teacher_note';
export type StudentHomeworkTaskStatus = 'done' | 'pending';
export type StudentHomeworkIconVariant = 'math' | 'science' | 'literature' | 'note';

export interface StudentHomeworkEntry {
  id: string;
  kind: StudentHomeworkEntryKind;
  metaLabel: string;
  status?: StudentHomeworkTaskStatus;
  statusLabel?: string;
  title?: string;
  description: string;
  attachmentLabel?: string;
  submitLabel?: string;
  detailsLabel?: string;
  iconVariant: StudentHomeworkIconVariant;
  authorAvatarUrl?: string;
  noteTimeLabel?: string;
}

export interface StudentHomeworkData {
  overview: StudentHomeworkOverview;
  diarySectionTitle: string;
  monthLabel: string;
  days: StudentHomeworkDayOption[];
  selectedDayId: string;
  entriesByDay: Record<string, StudentHomeworkEntry[]>;
}

export type StudentExamsTab = 'schedule' | 'results';

export interface StudentExamTrendBar {
  id: string;
  heightPercent: number;
  hoverLabel?: string;
}

export interface StudentExamFeatured {
  trendsTitle: string;
  growthLabel: string;
  trendBars: StudentExamTrendBar[];
  yourScoreLabel: string;
  yourScoreValue: string;
  classAvgLabel: string;
  classAvgValue: string;
  nextPaperBadge: string;
  nextPaperTitle: string;
  dateLabel: string;
  locationLabel: string;
}

export interface StudentExamScheduleItem {
  id: string;
  monthShort: string;
  dayNumber: number;
  subject: string;
  detailsLabel: string;
  dimmed?: boolean;
}

export interface StudentExamResultsOverview {
  averagePercent: number;
  accentPercent: number;
  averageLabel: string;
  barStats: StudentExamBarStat[];
  barCaption: string;
}

export interface StudentExamBarStat {
  id: string;
  shortLabel: string;
  percent: number;
  variant: 'primary' | 'accent';
}

export interface StudentExamUnitScore {
  unitLabel: string;
  percent: number;
  isActive: boolean;
}

export interface StudentExamSubjectBreakdown {
  id: string;
  subject: string;
  unitScores?: StudentExamUnitScore[];
  sparklinePath: string;
  sparklineFillPath: string;
  strokeColor: string;
  fillColor: string;
  pendingMessage?: string;
  dimmed?: boolean;
}

export interface StudentExamUnitResults {
  id: string;
  label: string;
  overview: StudentExamResultsOverview;
  breakdown: StudentExamSubjectBreakdown[];
}

export interface StudentExamsResultsData {
  overviewTitle: string;
  breakdownTitle: string;
  units: StudentExamUnitResults[];
}

export interface StudentExamsData {
  scheduleTabLabel: string;
  resultsTabLabel: string;
  upcomingExamsTitle: string;
  hallTicketLabel: string;
  featuredExam: StudentExamFeatured;
  upcomingExams: StudentExamScheduleItem[];
  results: StudentExamsResultsData;
}

export type StudentFeePaymentStatus = 'success' | 'completed';

export interface StudentFeesBanner {
  badgeLabel: string;
  sessionTitle: string;
}

export interface StudentFeesBalanceSummary {
  paidPercent: number;
  paidLabel: string;
  progressLabel: string;
  totalDueLabel: string;
  totalDueAmount: string;
  balanceDueLabel: string;
  balanceDueAmount: string;
}

export interface StudentFeesBalanceDetail {
  paidAmountLabel: string;
  paidAmount: string;
  nextInstallmentLabel: string;
  nextInstallmentDate: string;
}

export interface StudentFeesQuickPay {
  title: string;
  amountLabel: string;
  defaultAmount: number;
  currencyLabel: string;
  payNowLabel: string;
  secureLabel: string;
}

export interface StudentFeeTransaction {
  id: string;
  date: string;
  status: StudentFeePaymentStatus;
  statusLabel: string;
  transactionId: string;
  amount: string;
  dimmed?: boolean;
}

export interface StudentFeesSupport {
  message: string;
  buttonLabel: string;
}

export interface StudentFeesData {
  banner: StudentFeesBanner;
  balanceSummary: StudentFeesBalanceSummary;
  balanceDetailsTitle: string;
  balanceDetail: StudentFeesBalanceDetail;
  quickPay: StudentFeesQuickPay;
  paymentHistoryTitle: string;
  viewAllLabel: string;
  transactions: StudentFeeTransaction[];
  support: StudentFeesSupport;
}

export type StudentLeaveRequestStatus = 'pending' | 'approved' | 'rejected';

export interface StudentLeaveRequest {
  id: string;
  dateRange: string;
  durationLabel: string;
  leaveType: string;
  reason: string;
  status: StudentLeaveRequestStatus;
  statusLabel: string;
}

export interface StudentLeaveStats {
  remainingCount: number;
  remainingLabel: string;
  availedCount: number;
  availedLabel: string;
}

export interface StudentLeaveData {
  title: string;
  description: string;
  leaveTypes: string[];
  formSubmitLabel: string;
  requestsTitle: string;
  viewAllLabel: string;
  tableHeaders: {
    dates: string;
    typeReason: string;
    status: string;
  };
  requests: StudentLeaveRequest[];
  stats: StudentLeaveStats;
}

export type StudentNoticeCategory = 'all' | 'academic' | 'fees' | 'events' | 'administrative';

export type StudentNoticeVariant = 'urgent' | 'standard' | 'event' | 'administrative';

export interface StudentNoticeCategoryChip {
  id: StudentNoticeCategory;
  label: string;
}

export interface StudentNoticeItem {
  id: string;
  category: Exclude<StudentNoticeCategory, 'all'>;
  categoryLabel: string;
  dateLabel: string;
  title: string;
  excerpt: string;
  variant: StudentNoticeVariant;
  ctaLabel: string;
  imageUrl?: string;
  urgentBadge?: string;
}

export interface StudentNoticesData {
  title: string;
  description: string;
  categories: StudentNoticeCategoryChip[];
  notices: StudentNoticeItem[];
  loadMoreLabel: string;
}

export type StudentAlertPingType = 'urgent' | 'warning' | 'info';

export interface StudentAlertPing {
  id: string;
  type: StudentAlertPingType;
  typeLabel: string;
  dateLabel: string;
  title: string;
  message: string;
  ctaLabel: string;
  unread?: boolean;
}

export interface StudentAlertsData {
  title: string;
  description: string;
  unreadLabel: string;
  pings: StudentAlertPing[];
  loadMoreLabel: string;
}

export interface StudentProfilePersonalField {
  id: string;
  label: string;
  value: string;
  inputType: 'text' | 'email' | 'tel';
}

export interface StudentProfileSecurityItem {
  id: string;
  label: string;
  type: 'action' | 'toggle';
  defaultEnabled?: boolean;
}

export interface StudentProfileData {
  name: string;
  rollLabel: string;
  programBadge: string;
  avatarUrl: string;
  personalSectionTitle: string;
  personalFields: StudentProfilePersonalField[];
  securitySectionTitle: string;
  securityItems: StudentProfileSecurityItem[];
  saveLabel: string;
  lastUpdatedLabel: string;
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

export interface FacultyHelpFaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface FacultyHelpContact {
  id: string;
  label: string;
  value: string;
  hint: string;
}

export interface FacultyHelpQuickLink {
  id: string;
  label: string;
  description: string;
}

export interface FacultyHelpSupportData {
  title: string;
  description: string;
  faqSectionTitle: string;
  faqs: FacultyHelpFaqItem[];
  contactSectionTitle: string;
  contacts: FacultyHelpContact[];
  quickLinksTitle: string;
  quickLinks: FacultyHelpQuickLink[];
  submitTicketLabel: string;
  submitTicketFootnote: string;
}

export type StudentHelpCenterData = FacultyHelpSupportData;

export type WalkthroughTourKind = 'dashboard' | 'module';

export type WalkthroughPlacement = 'top' | 'bottom' | 'center';

export interface WalkthroughHighlightInset {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export interface WalkthroughStepConfig {
  id: string;
  targetId?: string;
  title: string;
  description: string;
  placement?: WalkthroughPlacement;
  highlightInset?: WalkthroughHighlightInset;
}

export interface WalkthroughProgressRecord {
  userId: string;
  hasCompletedWalkthrough: boolean;
  moduleCompletions: Record<string, boolean>;
  updatedAt: string;
}

export interface WalkthroughModuleOption {
  id: string;
  label: string;
  description: string;
}

export interface WalkthroughTargetLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}
