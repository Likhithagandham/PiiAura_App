import type { ClassBatchSection, ClassSectionOption, FacultyOption, RoomMaster } from "./academics";

export type ExamScheduleStatus = "draft" | "published";

export interface ExamRoomOption extends Pick<RoomMaster, "id" | "name"> {
  capacity: number;
}

export interface ExamFacultyOption extends Pick<FacultyOption, "userId" | "name"> {}

export interface ExamClassOption extends Pick<ClassSectionOption, "id" | "label"> {}

export interface ExamSlot {
  id: string;
  name: string;
  examId?: string;
  examName?: string;
  classSectionId: string;
  classLabel: string;
  subjectId: string;
  subjectName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  roomId: string;
  roomName: string;
  status: ExamScheduleStatus;
  /** F-253 — faculty cannot edit marks after this instant */
  marksEntryDeadlineAt?: string;
  /** Target number of invigilators for this slot (hard cap on manual add). */
  requiredInvigilators?: number;
}

export interface ExamSummary {
  id: string;
  name: string;
  examType?: string;
  isPublished?: boolean;
  resultStatus?: string;
}

export interface SaveExamMarksInput {
  examSlotId: string;
  studentId: string;
  marks: number | null;
  maxMarks?: number;
}

export interface SaveExamMarksOptions {
  actorRole: "faculty" | "admin";
  actorId: string;
  actorName: string;
  ipAddress?: string;
}

export type ExamClashType = "room_overlap" | "class_overlap";

export interface ExamClash {
  type: ExamClashType;
  slotId: string;
  otherSlotId: string;
  message: string;
}

export interface SaveExamSlotInput {
  id?: string;
  name: string;
  classSectionId: string;
  subjectId: string;
  date: string;
  startTime: string;
  endTime: string;
  roomId: string;
  status: ExamScheduleStatus;
  requiredInvigilators?: number;
}

export interface StudentExamProfile {
  studentId: string;
  name: string;
  classSectionId: string;
  classLabel: string;
  examFeePaid: boolean;
  /** College-only (F-047) */
  regulationYear?: string; // e.g. 2024
  /** College-only (F-047) */
  rollNumber?: string;
}

export interface HallTicketResult {
  studentId: string;
  studentName: string;
  canDownload: boolean;
  blockedReason?: string;
  content: string; // mock "PDF" text payload
  generatedAt: string;
}

export interface SeatingAllocation {
  roomId: string;
  roomName: string;
  seats: { studentId: string; studentName: string; seatNo: number }[];
}

export interface SeatingPlan {
  examSlotId: string;
  generatedAt: string;
  totalStudents: number;
  allocations: SeatingAllocation[];
  note: string;
}

export type SeatingOrder = "random" | "alphabetical";
export type SeatingGenerateMode = "per_slot" | "combined";

export interface SeatingPreflightItem {
  examSlotId: string;
  classLabel: string;
  subjectName: string;
  registeredCount: number;
  roomCapacity: number;
  status: "ready" | "warning" | "blocked";
  issues: string[];
}

export interface SeatingPreflightResult {
  totalSlots: number;
  readyCount: number;
  items: SeatingPreflightItem[];
}

export interface SeatingBulkError {
  examSlotId: string;
  errors: Record<string, unknown>;
}

export interface SeatingSession {
  id: string;
  name: string;
  hallRoomId: string;
  hallRoomName: string;
  startAt: string;
  endAt: string;
  examSlotIds: string[];
}

export interface InvigilationAssignment {
  examSlotId: string;
  /** Human-readable label when provided by the backend */
  slotLabel?: string;
  facultyId: string;
  facultyName: string;
  assignedAt: string;
  assignedBy: "auto" | "manual";
}

export type ExamResultStatus = "draft" | "pending_publish" | "provisional" | "published" | "revised";

/**
 * College-only: when true, AB (absent) is stored as null marks and excluded from GPA calc.
 * Schools should always treat absence as a grade/remark and not GPA-bearing.
 */
export interface ResultsConfig {
  absentAsNullEnabled: boolean;
  excludeAbsentFromGpa: boolean;
}

/** College-only (F-128) */
export interface GraceMarksConfig {
  enabled: boolean;
  /** Maximum grace marks that can be added per subject to reach pass */
  maxPerSubject: number;
  /** Pass threshold percent (e.g. 35) */
  passPercent: number;
}

export interface ExamMarkEntry {
  examSlotId: string;
  studentId: string;
  studentName: string;
  classLabel: string;
  subjectName: string;
  /** Null means AB (absent) — college-only behavior when enabled */
  marks: number | null;
  maxMarks: number;
  updatedAt: string;
  marksStatus?: "draft" | "submitted" | "locked";
}

export interface ResultsSlotPreflight {
  examSlotId: string;
  classLabel: string;
  subjectName: string;
  registeredCount: number;
  enteredCount: number;
  submittedCount: number;
  status: "ready" | "warning" | "blocked";
}

export interface ResultsPreflightResult {
  examId: string;
  examName: string;
  isPublished: boolean;
  resultStatus: string;
  slots: ResultsSlotPreflight[];
  readyCount: number;
  totalSlots: number;
  canPublish: boolean;
  blockers: string[];
}

export interface ResultPublicationSummary {
  id: string;
  examId: string;
  publishedAt: string;
  publishedByUserId: string;
  revisionNo: number;
  note: string;
  isCurrent: boolean;
}

export interface PublishedMarkEntry extends ExamMarkEntry {
  /** Marks after applying grace (if any) */
  finalMarks: number | null;
  graceApplied: number;
  remark: "OK" | "AB";
}

export interface ResultPublishConfirmation {
  token: string;
  createdAt: string;
  expiresAt: string;
  summary: {
    examSlotId?: string;
    examId?: string;
    examName?: string;
    totalStudents: number;
    absentCount: number;
    averagePercent: number;
  };
}

export interface PublishedResultSnapshot {
  id: string;
  examSlotId: string;
  publishedAt: string;
  publishedByUserId: string;
  revisionNo: number; // 1..n
  note: string;
  entries: PublishedMarkEntry[];
}

export interface ResultsAnalytics {
  examSlotId: string;
  generatedAt: string;
  passPercent: number;
  absentCount: number;
  averagePercent: number;
  toppers: { studentId: string; studentName: string; percent: number }[];
  breakdown: { band: string; count: number }[];
}

/** College-only (F-129) */
export interface ArrearAttempt {
  id: string;
  studentId: string;
  studentName: string;
  subjectId: string;
  subjectName: string;
  attemptNo: number;
  scheduledExamSlotId: string | null;
  status: "pending" | "scheduled" | "cleared";
}

/** College-only (F-130) */
export interface StudentGpaMetric {
  studentId: string;
  studentName: string;
  classLabel: string;
  sgpa: number;
  cgpa: number;
  calculatedAt: string;
}

export interface ExamSlotWarning {
  type: "holiday";
  message: string;
}

export interface PdfExportResult {
  canDownload: boolean;
  blockedReason?: string;
  fileName: string;
  content: string; // mock PDF bytes represented as text payload
  generatedAt: string;
}

export interface StudentExamHubData {
  institutionType: "school" | "college";
  student: { studentId: string; name: string; classLabel: string; examFeePaid: boolean };
  upcomingExams: ExamSlot[];
  hallTicketAvailable: boolean;
  publishedResults: { examSlotId: string; subjectName: string; publishedAt: string; percent: number | null; remark: string }[];
}

export interface ExaminationsData {
  institutionType: "school" | "college";
  exams?: ExamSummary[];
  slots: ExamSlot[];
  clashes: ExamClash[];
  rooms: ExamRoomOption[];
  classes: ExamClassOption[];
  classSections?: ClassBatchSection[];
  subjects: { id: string; name: string }[];
  faculty: ExamFacultyOption[];
  students: StudentExamProfile[];
  seatingPlans: SeatingPlan[];
  invigilation: InvigilationAssignment[];
  resultsConfig: ResultsConfig;
  graceMarks: GraceMarksConfig;
  resultStatusByExam: Record<string, ExamResultStatus>;
  markEntries: ExamMarkEntry[];
  publishedResults: PublishedResultSnapshot[];
  arrears?: ArrearAttempt[];
  gpaMetrics: StudentGpaMetric[];
  warningsByExam: Record<string, ExamSlotWarning[]>;
}

