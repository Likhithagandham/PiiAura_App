export type HrEmploymentType = "full_time" | "part_time" | "contract" | "intern";

export interface HrBranch {
  id: string;
  name: string;
}

export interface HrEmployee {
  id: string;
  name: string;
  roleLabel: string; // e.g. Faculty, Accountant, Admin
  employmentType: HrEmploymentType;
  primaryBranchId: string;
  primaryBranchName: string;
  active: boolean;
  joinedAt: string; // ISO
  exitedAt?: string | null; // ISO (for pro-rata exit)
  /** Staff attendance days in the current calendar month */
  presentDays?: number;
  absentDays?: number;
  leaveDays?: number;
}

// F-161: multi-branch assignment + salary branch flag
export interface HrEmployeeBranchAssignment {
  id: string;
  employeeId: string;
  employeeName: string;
  branchId: string;
  branchName: string;
  isSalaryBranch: boolean;
  fromDate: string; // YYYY-MM-DD
  toDate: string | null; // YYYY-MM-DD
}

export type HrLeaveType = "casual" | "sick" | "earned" | "unpaid";
export type HrLeaveStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface HrLeaveBalance {
  employeeId: string;
  employeeName: string;
  asOf: string; // YYYY-MM-DD
  balances: Record<HrLeaveType, number>; // days
}

export interface HrLeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  branchId: string;
  branchName: string;
  leaveType: HrLeaveType;
  fromDate: string; // YYYY-MM-DD
  toDate: string; // YYYY-MM-DD
  days: number;
  reason: string;
  status: HrLeaveStatus;
  requestedAt: string; // ISO
  reviewedAt: string | null; // ISO
  reviewerName: string | null;
  reviewNote: string | null;
}

// F-163: branch admin approval
export interface HrBranchAdmin {
  branchId: string;
  branchName: string;
  adminUserId: string;
  adminName: string;
}

export interface HrSalaryComponent {
  id: string;
  name: string;
  kind: "earning" | "deduction";
  amount: number; // INR (display)
  amountPaise?: number; // integer paise (preferred storage)
}

// F-166: reusable salary component templates
export interface HrSalaryComponentTemplate {
  id: string;
  name: string;
  kind: "earning" | "deduction";
  amount: number; // INR
  amountPaise?: number;
  active: boolean;
  createdAt: string;
}

// F-164: corrections via adjustment
export interface HrPayrollAdjustment {
  id: string;
  payrollRunId: string;
  employeeId: string;
  employeeName: string;
  kind: "earning" | "deduction";
  label: string;
  amount: number; // INR
  amountPaise?: number;
  note: string;
  createdAt: string;
}

export interface HrPayrollRun {
  id: string;
  month: string; // YYYY-MM
  branchId: string;
  branchName: string;
  status: "draft" | "processed";
  components: HrSalaryComponent[];
  employeeCount: number;
  totalGross: number; // INR
  totalNet: number; // INR
  processedAt: string | null; // ISO
  immutable: boolean;
  adjustments: HrPayrollAdjustment[];
}

export interface HrPayslipPdfResult {
  canDownload: boolean;
  blockedReason?: string;
  fileName: string;
  content: string;
  /** F-159 — mock S3 signed download URL */
  s3Key?: string;
  downloadUrl?: string;
  downloadUrlExpiresAt?: string;
}

export interface HrComplianceExportResult {
  canDownload: boolean;
  blockedReason?: string;
  fileName: string;
  content: string;
}

export interface HrFacultyOption {
  userId: string;
  name: string;
  employeeCode: string;
  roleLabel: string;
}

export interface HrData {
  branches: HrBranch[];
  branchAdmins: HrBranchAdmin[];
  employees: HrEmployee[];
  /** Faculty users in this branch without an HR employee record yet */
  availableFaculty?: HrFacultyOption[];
  assignments: HrEmployeeBranchAssignment[];
  leaveBalances: HrLeaveBalance[];
  leaveRequests: HrLeaveRequest[];
  payrollRuns: HrPayrollRun[];
  componentTemplates: HrSalaryComponentTemplate[];
  documents: HrEmployeeDocument[];
}

// F-170: HR document storage
export interface HrEmployeeDocument {
  id: string;
  employeeId: string;
  employeeName: string;
  title: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  s3Key: string; // mock S3 key
  uploadedAt: string;
}

export interface SaveEmployeeInput {
  id?: string;
  userId?: string;
  employeeCode?: string;
  name: string;
  roleLabel: string;
  employmentType: HrEmploymentType;
  primaryBranchId: string;
  active: boolean;
  joinedAt?: string; // YYYY-MM-DD (for pro-rata join)
  exitedAt?: string | null; // YYYY-MM-DD (for pro-rata exit)
}

export interface SaveAssignmentInput {
  id?: string;
  employeeId: string;
  branchId: string;
  isSalaryBranch: boolean;
  fromDate: string;
  toDate?: string | null;
}

export interface ApplyLeaveInput {
  employeeId: string;
  leaveType: HrLeaveType;
  fromDate: string;
  toDate: string;
  reason: string;
}

export interface ReviewLeaveInputHr {
  requestId: string;
  approve: boolean;
  note?: string;
}

export interface RunPayrollInput {
  month: string; // YYYY-MM
  branchId: string;
  components: { name: string; kind: "earning" | "deduction"; amount: number }[];
}

export interface SaveSalaryTemplateInput {
  id?: string;
  name: string;
  kind: "earning" | "deduction";
  amount: number;
  active: boolean;
}

export interface CreatePayrollAdjustmentInput {
  payrollRunId: string;
  employeeId: string;
  kind: "earning" | "deduction";
  label: string;
  amount: number;
  note?: string;
}

export interface HrReportExportResult {
  fileName: string;
  content: string;
}


