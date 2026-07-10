import type { AttendanceRulesSettings } from "./settings";
import type { ClassBatchSection } from "./academics";
import type { LiveAttendanceSnapshot, LiveClassAttendance } from "./dashboard";

export type { LiveAttendanceSnapshot, LiveClassAttendance };

export type AttendanceStatus = "present" | "absent" | "late" | "leave" | "excused";

export type LeaveRequestStatus = "pending" | "approved" | "rejected";

export type AttendanceAuditType = "retroactive_edit" | "late_marking" | "geo_fence_failure";

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber?: string;
  classSectionId: string;
  classLabel: string;
  subjectId: string;
  subjectName: string;
  date: string;
  status: AttendanceStatus;
  markedAt: string;
  /** F-295 — faculty who marked (substitute when substitution active) */
  markedByUserId: string;
  /** F-295 — original timetable faculty for reporting */
  attributionToUserId?: string | null;
  classEndTime: string;
  isExamDay: boolean;
  /** F-103 — outside geo-fence or location missing */
  geoFlagged?: boolean;
  geoFlagReason?: string | null;
}

export interface AttendanceAuditEntry {
  id: string;
  type: AttendanceAuditType;
  recordId: string;
  studentName: string;
  classLabel: string;
  subjectName: string;
  date: string;
  originalStatus?: AttendanceStatus;
  newStatus?: AttendanceStatus;
  markedAt?: string;
  classEndTime?: string;
  hoursAfterClassEnd?: number;
  editedByUserId: string;
  attributionToUserId?: string | null;
  createdAt: string;
  note: string;
}

export interface LeaveRequest {
  id: string;
  studentId: string;
  studentName: string;
  classSectionId: string;
  classLabel: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: LeaveRequestStatus;
  appliedByRole: "student" | "parent";
  appliedByName: string;
  appliedAt: string;
  reviewedByUserId: string | null;
  reviewedByName: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
}

export interface StudentShortageRow {
  studentId: string;
  studentName: string;
  classSectionId: string;
  classLabel: string;
  presentDays: number;
  totalDays: number;
  percent: number;
  thresholdPercent: number;
}

export interface MonthlySubjectReportRow {
  month: string;
  subjectId: string;
  subjectName: string;
  classLabel: string;
  presentCount: number;
  totalSessions: number;
  percent: number;
}

/** Per-student attendance % for a weekly or monthly period. */
export interface PeriodStudentReportRow {
  period: string;
  studentId: string;
  studentName: string;
  classSectionId: string;
  classLabel: string;
  presentDays: number;
  totalDays: number;
  percent: number;
}

/** @deprecated Use PeriodStudentReportRow */
export type MonthlyStudentReportRow = PeriodStudentReportRow & { month?: string };

export interface AttendanceReportFilters {
  period: "weekly" | "monthly";
  week?: string;
  month?: string;
  batchId?: string | null;
  dateFrom: string;
  dateTo: string;
}

export interface AttendanceReportQuery {
  period?: "weekly" | "monthly";
  week?: string;
  month?: string;
  batchId?: string;
}

export interface AttendanceData {
  live: LiveAttendanceSnapshot;
  rules: AttendanceRulesSettings;
  records: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
  classSections?: ClassBatchSection[];
  auditLog: AttendanceAuditEntry[];
  shortageReport: StudentShortageRow[];
  detentionList: StudentShortageRow[];
  periodReports: PeriodStudentReportRow[];
  reportFilters?: AttendanceReportFilters;
}

export interface CorrectAttendanceInput {
  recordId: string;
  newStatus: AttendanceStatus;
  note: string;
  geoFlagged?: boolean;
  geoFlagReason?: string | null;
}

export interface ReviewLeaveInput {
  requestId: string;
  approve: boolean;
  reviewNote?: string;
}

export interface CreateLeaveInput {
  studentName: string;
  studentId?: string;
  classSectionId: string;
  fromDate: string;
  toDate: string;
  reason: string;
  appliedByRole: "student" | "parent";
  appliedByName?: string;
}

export interface AdminMarkPeriodSlot {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
}

export interface AdminMarkSubjectOption {
  id: string;
  name: string;
}

export interface AdminMarkAttendanceQuery {
  date?: string;
  batchId?: string;
  batchSubjectId?: string;
  periodSlotId?: string;
}

export interface AdminMarkAttendanceContext {
  mode: "day" | "session";
  date: string;
  holiday: { blocked: boolean; date: string };
  sessionId?: string;
  classLabel?: string;
  subjectName?: string;
  records: AttendanceRecord[];
  subjects?: AdminMarkSubjectOption[];
  periodSlots?: AdminMarkPeriodSlot[];
  classSections?: ClassBatchSection[];
}

export interface AdminBulkMarkInput {
  recordId: string;
  status: AttendanceStatus;
}
