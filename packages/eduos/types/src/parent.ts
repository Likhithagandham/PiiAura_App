import type { Announcement } from "./admin";
import type { LeaveRequest } from "./admin/attendance";
import type {
  CreateStudentGrievanceInput,
  StudentAssignmentsData,
  StudentApplyLeaveInput,
  StudentFeesData,
  StudentGrievance,
  StudentGrievancesData,
  StudentLeaveData,
  StudentProfile,
  StudentResultsData,
} from "./student";

/** Portal access gate when the institution disables the parent portal. */
export interface ParentPortalAccess {
  allowed: boolean;
  reason?: string;
  institutionType: "school" | "college";
}

export interface ParentTodayAttendance {
  status: "present" | "absent" | "late" | "excused" | "unmarked";
  markedAt: string | null;
  subjectName: string | null;
}

export interface ParentDashboardAssignment {
  id: string;
  title: string;
  subjectName: string;
  dueAt: string;
  status: "pending" | "submitted";
}

export interface ParentDashboardData {
  child: StudentProfile;
  linkedChildrenCount: number;
  attendanceToday: ParentTodayAttendance;
  attendancePercent: number;
  feeAlert: { message: string; amountDue: number } | null;
  upcomingExamsCount: number;
  nextExamLabel: string | null;
  todayAssignments: ParentDashboardAssignment[];
  announcements: Announcement[];
}

export interface ParentLeaveData extends StudentLeaveData {}

export interface ParentApplyLeaveInput extends StudentApplyLeaveInput {}

export type ParentFeesData = StudentFeesData;

/** Published results only (same shape as student). */
export type ParentResultsData = StudentResultsData;

export type ParentAssignmentsData = StudentAssignmentsData;

export type ParentGrievancesData = StudentGrievancesData;

export type ParentGrievance = StudentGrievance;

export type ParentCreateGrievanceInput = CreateStudentGrievanceInput;

/** Absence alert notification channels. */
export interface ParentAbsenceAlertPrefs {
  sms: boolean;
  in_app: boolean;
  email: boolean;
}

export interface ParentAnnouncementsData {
  announcements: Announcement[];
}
