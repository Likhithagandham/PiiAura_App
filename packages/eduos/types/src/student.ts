import type { Announcement } from "./admin";
import type { StudyMaterial } from "./admin/academics";
import type { LeaveRequest } from "./admin/attendance";
import type { FacultyAssignment, FacultyAssignmentSubmission } from "./faculty";

export interface StudentProfile {
  studentId: string;
  name: string;
  classLabel: string;
  classSectionId: string;
  rollNumber: string | null;
}

export interface StudentScheduleItem {
  subjectName: string;
  startTime: string;
  endTime: string;
  roomName: string;
  dayLabel: string;
}

export interface StudentAttendanceAlert {
  level: "warning" | "critical";
  message: string;
  attendancePercent: number;
  thresholdPercent: number;
}

export interface StudentDashboardData {
  institutionType: "school" | "college";
  profile: StudentProfile;
  attendancePercent: number;
  attendanceThreshold: number;
  attendanceAlert: StudentAttendanceAlert | null;
  feeAlert: { message: string; amountDue: number } | null;
  scheduleToday: StudentScheduleItem[];
  upcomingExamsCount: number;
  nextExamLabel: string | null;
  /** College-only — hall tickets are not issued for schools. */
  hallTicketAvailable: boolean;
  announcements: Announcement[];
}

export interface StudentLeaveData {
  requests: LeaveRequest[];
}

export interface StudentApplyLeaveInput {
  fromDate: string;
  toDate: string;
  reason: string;
}

export interface StudentMaterialsData {
  folders: Array<{
    id: string;
    name: string;
    materials: (StudyMaterial & { unitTitles: string[] })[];
  }>;
  general: (StudyMaterial & { unitTitles: string[] })[];
}

export interface StudentAssignmentsData {
  assignments: FacultyAssignment[];
  submissions: FacultyAssignmentSubmission[];
}

export interface StudentSubmitAssignmentInput {
  assignmentId: string;
  fileName: string;
  mimeType?: string;
  sizeBytes?: number;
}

export interface StudentExamFeeRow {
  examSlotId: string;
  examLabel: string;
  examDate: string;
  amount: number;
  invoiceId: string;
  status: "unpaid" | "paid" | "cancelled";
  paidAt: string | null;
}

export interface StudentExamFeesData {
  rows: StudentExamFeeRow[];
  allPaid: boolean;
}

export interface StudentResultRow {
  examSlotId: string;
  examLabel: string;
  subjectName: string;
  publishedAt: string;
  percent: number | null;
  remark: string;
}

export interface StudentResultsData {
  institutionType: "school" | "college";
  results: StudentResultRow[];
  gpa: { sgpa: number; cgpa: number; calculatedAt: string } | null;
}

export interface StudentPerformanceTrendPoint {
  label: string;
  percent: number;
}

export interface StudentPerformanceSubject {
  subjectName: string;
  latestPercent: number | null;
  remark: string;
  trend: StudentPerformanceTrendPoint[];
}

export interface StudentPerformanceData {
  institutionType: "school" | "college";
  overallAverage: number | null;
  subjects: StudentPerformanceSubject[];
}

export type StudentGrievanceStatus = "open" | "in_review" | "resolved" | "closed";

export interface StudentGrievance {
  id: string;
  category: string;
  subject: string;
  description: string;
  status: StudentGrievanceStatus;
  createdAt: string;
  updatedAt: string;
  resolutionNote: string | null;
  /** F-255 — who raised it (student or parent). */
  raisedByRole?: "student" | "parent";
  raisedByName?: string;
  /** F-255 — admin assignment. */
  assignedToId?: string | null;
  assignedToName?: string | null;
  assignedAt?: string | null;
}

export interface StudentGrievancesData {
  grievances: StudentGrievance[];
}

export interface CreateStudentGrievanceInput {
  category: string;
  subject: string;
  description: string;
}

/** F-255 — admin-facing grievance row with raiser context. */
export interface AdminGrievanceRow extends StudentGrievance {
  raisedByRole: "student" | "parent";
  raisedById: string;
  raisedByName: string;
  classLabel: string;
}

export interface AdminGrievancesData {
  grievances: AdminGrievanceRow[];
}

export interface AssignGrievanceInput {
  grievanceId: string;
  assigneeId: string;
  assigneeName: string;
}

export interface ResolveGrievanceInput {
  grievanceId: string;
  resolutionNote: string;
  status?: "resolved" | "closed";
}

export interface StudentQuizAnswerInput {
  questionIndex: number;
  selectedAnswer: string;
}

export interface StudentQuizQuestionFeedback {
  questionIndex: number;
  correct: boolean;
  correctAnswer: string;
  explanation: string;
}

export interface StudentQuizAttemptResult {
  quizId: string;
  title: string;
  scorePercent: number;
  correctCount: number;
  totalQuestions: number;
  feedback: StudentQuizQuestionFeedback[];
  attemptedAt: string;
}

export interface StudentFeeLedgerSummary {
  totalDue: number;
  paid: number;
  balance: number;
  nextDueDate: string | null;
  isOverdue: boolean;
}

export interface StudentFeePaymentRow {
  id: string;
  paidAt: string;
  amount: number;
  method: string;
  receiptNo: string;
  orderId: string;
  status: string;
}

export interface StudentFeeInstallmentRow {
  invoiceId: string;
  installmentId: string;
  sequence: number;
  label: string;
  dueDate: string;
  amount: number;
  paid: number;
  balance: number;
  status: "due" | "partial" | "paid" | "overdue";
}

export interface StudentFeesData {
  institutionType: "school" | "college";
  ledger: StudentFeeLedgerSummary;
  payments: StudentFeePaymentRow[];
  razorpayKeyId: string;
  examFees: {
    rows: StudentExamFeeRow[];
    allPaid: boolean;
  };
  installmentSchedule?: StudentFeeInstallmentRow[];
}

export interface StudentRazorpayOrder {
  orderId: string;
  /** Internal Payment UUID — required for Django verify capture. */
  backendPaymentId?: string;
  amount: number;
  amountPaise: number;
  currency: string;
  razorpayKeyId: string;
}

export interface StudentProfileFormData {
  userId: string;
  name: string;
  phone: string | null;
  ownPhone: string | null;
  customLoginId: string | null;
  classLabel: string;
  rollNumber: string | null;
  editableFields: ("name" | "ownPhone")[];
}

export interface UpdateStudentProfileInput {
  name?: string;
  ownPhone?: string;
}

export interface ChangeStudentPasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface StudentDeviceSession {
  sessionId: string;
  deviceType: "mobile" | "desktop" | "unknown";
  deviceLabel: string;
  createdAt: string;
  lastActiveAt: string;
  isCurrent: boolean;
}

export interface StudentSessionsData {
  sessions: StudentDeviceSession[];
  concurrentSessionsAllowed: boolean;
}
