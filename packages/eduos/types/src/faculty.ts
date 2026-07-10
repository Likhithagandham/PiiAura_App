import type {
  Announcement,
  AttendanceRecord,
  AttendanceStatus,
  Holiday,
  DailyHomeworkEntry,
  ExamMarkEntry,
  HrLeaveRequest,
  HrPayslipPdfResult,
  InvigilationAssignment,
  LeaveRequest,
  PdfExportResult,
  SaveHomeworkInput,
  StudyMaterial,
  SyllabusUnit,
  TimetableSlot,
} from "./admin";

export interface FacultyDashboardCard {
  id: "schedule" | "attendance" | "leave" | "marks" | "announcements" | "payslip";
  title: string;
  value: string;
  hint?: string;
  href?: string;
}

export interface FacultyDashboardSnapshot {
  sessionsToday: number;
  sessionsCompleted: number;
  pendingLeave: number;
  announcementsCount: number;
  attendanceMarkedPercent: number;
  syllabusProgressPercent: number;
}

export interface FacultyQuickAction {
  id: string;
  label: string;
  description: string;
  href: string;
  variant: "primary" | "secondary";
}

export interface FacultyDashboardAlert {
  id: string;
  title: string;
  message: string;
  severity: "info" | "warning" | "critical";
  href?: string;
  count?: number;
}

export interface FacultyDashboardData {
  today: string;
  schedule: (TimetableSlot & { classLabel: string; subjectName: string; roomName?: string })[];
  snapshot: FacultyDashboardSnapshot;
  quickActions: FacultyQuickAction[];
  alerts: FacultyDashboardAlert[];
  /** @deprecated Use snapshot + quickActions; kept for API compatibility */
  cards: FacultyDashboardCard[];
  announcements: Announcement[];
  upcomingHolidays: Holiday[];
}

export interface FacultyAttendanceSession {
  date: string;
  classSectionId: string;
  classLabel: string;
  subjectId: string;
  subjectName: string;
  recordIds: string[];
}

export interface FacultyAttendanceHolidayBlock {
  blocked: boolean;
  date: string;
  holidayName?: string;
}

export interface FacultyAttendanceGeoFence {
  enabled: boolean;
  campusLabel: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
}

export interface FacultyMarkAttendanceGeo {
  latitude: number;
  longitude: number;
}

export interface FacultyMarkAttendanceInput {
  recordId: string;
  newStatus: AttendanceStatus;
  geo?: FacultyMarkAttendanceGeo;
}

export interface FacultyAttendanceData {
  date: string;
  sessions: FacultyAttendanceSession[];
  records: AttendanceRecord[];
  holiday: FacultyAttendanceHolidayBlock;
  geoFence: FacultyAttendanceGeoFence;
}

export interface FacultyLeaveData {
  pending: LeaveRequest[];
  decided: LeaveRequest[];
}

export interface FacultyNotesData {
  folders: Array<{
    id: string;
    name: string;
    materials: StudyMaterial[];
  }>;
  general: StudyMaterial[];
}

export interface FacultyInvigilationData {
  assignments: InvigilationAssignment[];
}

export type FacultyTimetableDayKind = "working" | "holiday" | "leave" | "off";

export type FacultySessionAttendanceStatus =
  | "completed"
  | "pending"
  | "not_due"
  | "holiday"
  | "leave";

export interface FacultyTimetablePeriod {
  entryId: string;
  classSectionId: string;
  classLabel: string;
  subjectId: string;
  subjectName: string;
  roomId: string;
  roomName: string;
  startTime: string;
  endTime: string;
  periodIndex: number;
}

export interface FacultyTimetableDay {
  dayOfWeek: number;
  label: string;
  periods: FacultyTimetablePeriod[];
}

export type FacultyStaffDayStatus =
  | "present"
  | "absent"
  | "leave"
  | "not_marked"
  | "not_due"
  | "holiday"
  | "off";

export interface FacultyCalendarDaySummary {
  date: string;
  dayKind: FacultyTimetableDayKind;
  holidayName?: string | null;
  holidayType?: string | null;
  leaveReason?: string | null;
  /** Recorded staff attendance on a working day (present / absent / leave). */
  staffStatus?: "present" | "absent" | "leave" | null;
}

export interface FacultyTimetableHolidayItem {
  id: string;
  name: string;
  date: string;
  holidayType: string;
}

export interface FacultyVacationPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

export interface FacultyTimetableSummary {
  monthLabel: string;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  attendancePercent: number;
}

export interface FacultyDayDetail {
  date: string;
  dayKind: FacultyTimetableDayKind;
  leaveReason?: string | null;
  holidayName?: string | null;
  staffStatus: FacultyStaffDayStatus;
  canCheckIn: boolean;
}

export interface FacultyTimetableData {
  weekly: { days: FacultyTimetableDay[] };
  calendar: {
    year: number;
    month: number;
    days: FacultyCalendarDaySummary[];
    holidays: FacultyTimetableHolidayItem[];
    vacationPeriods: FacultyVacationPeriod[];
  };
  summary: FacultyTimetableSummary;
  dayDetail?: FacultyDayDetail;
}

export interface FacultyPayslipMonthOption {
  month: string;
  label: string;
  status: "processed" | "draft";
}

export interface FacultyPayslipData {
  employeeId: string | null;
  employeeName: string | null;
  selectedMonth: string;
  months: FacultyPayslipMonthOption[];
  result: HrPayslipPdfResult | null;
}

export interface FacultySyllabusSubject {
  id: string;
  batchId: string;
  name: string;
  code: string;
  classLabel: string;
  syllabusCompletionPercent: number;
  syllabusUnits: SyllabusUnit[];
  completedUnitIds: string[];
}

export interface FacultySyllabusProgressData {
  subjects: FacultySyllabusSubject[];
}

export interface FacultyUpdateSyllabusInput {
  subjectId: string;
  batchId: string;
  completedUnitIds: string[];
}

export interface FacultyAnnouncementsData {
  announcements: Announcement[];
  facultyBranchIds: string[];
  facultyBranchNames: string[];
}

export interface FacultySettingsData {
  institutionType: "school" | "college";
}

export interface FacultyTeachingClass {
  classSectionId: string;
  classLabel: string;
  subjects: { id: string; name: string }[];
}

export interface FacultyHomeroomClass {
  classSectionId: string;
  classLabel: string;
}

/** F-042 */
export interface FacultyHomeworkData {
  institutionType: "school" | "college";
  viewScope: "school" | "college";
  facultyUserId: string;
  canAssign: boolean;
  myClass: {
    homerooms: FacultyHomeroomClass[];
    homework: DailyHomeworkEntry[];
  };
  otherClasses: {
    teachingClasses: FacultyTeachingClass[];
    homework: DailyHomeworkEntry[];
  };
}

export type FacultySaveHomeworkInput = SaveHomeworkInput;

export interface FacultyAssignment {
  id: string;
  title: string;
  description: string;
  classSectionId: string;
  classLabel: string;
  subjectId: string;
  subjectName: string;
  dueAt: string;
  createdAt: string;
  createdByUserId: string;
}

export interface FacultyAssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  attachmentName: string;
  /** F-186 */
  similarityPercent: number;
  similarityStatus: "ok" | "warning" | "high";
}

export interface FacultyAssignmentsData {
  facultyUserId: string;
  myClass: {
    homerooms: FacultyHomeroomClass[];
    assignments: FacultyAssignment[];
  };
  otherClasses: {
    teachingClasses: FacultyTeachingClass[];
    assignments: FacultyAssignment[];
  };
  submissions: FacultyAssignmentSubmission[];
}

export interface CreateFacultyAssignmentInput {
  title: string;
  description: string;
  classSectionId: string;
  subjectId: string;
  dueAt: string;
}

export interface FacultyInternalMarkRow {
  studentId: string;
  studentName: string;
  classLabel: string;
  subjectId: string;
  subjectName: string;
  marks: number | null;
  maxMarks: number;
  updatedAt: string;
  hardDeadlineAt: string;
  recordedByName?: string;
}

export interface FacultyExamSlotOption {
  id: string;
  label: string;
  marksEntryDeadlineAt: string;
  entryLocked: boolean;
}

export interface FacultyMarksSection {
  homerooms?: FacultyHomeroomClass[];
  teachingClasses?: FacultyTeachingClass[];
  examSlots: FacultyExamSlotOption[];
  examEntries: ExamMarkEntry[];
  internal: FacultyInternalMarkRow[];
  canEdit: boolean;
}

export interface FacultyMarksData {
  facultyUserId: string;
  myClass: FacultyMarksSection;
  classesITeach: FacultyMarksSection;
}

export interface FacultyMyLeaveData {
  balances: { leaveType: string; balanceDays: number }[];
  requests: HrLeaveRequest[];
}

export interface FacultyApplyLeaveInput {
  leaveType: "casual" | "sick" | "earned" | "unpaid";
  fromDate: string;
  toDate: string;
  reason: string;
}

export interface FacultyProfileFormData {
  userId: string;
  name: string;
  ownPhone: string | null;
  customLoginId: string | null;
  designation: string;
  department: string;
  editableFields: ("name" | "ownPhone")[];
}

export interface UpdateFacultyProfileInput {
  name?: string;
  ownPhone?: string;
}

export type {
  AiGeneratedPaper,
  AiGeneratedQuiz,
  AiPaperQuestion,
  AiQuestionType,
  AiQuizMcq,
  FacultyQuestionPaperDraft,
  FacultyQuestionPaperDraftsData,
  FacultyQuizDraft,
  FacultyQuizDraftsData,
  GenerateAiQuestionPaperRequest,
  GenerateAiQuestionPaperResponse,
  GenerateAiQuizRequest,
  GenerateAiQuizResponse,
  StudentPracticeQuizSummary,
  UpdateAiQuestionPaperRequest,
  UpdateAiQuizRequest,
} from "./faculty-ai";

