export interface SuperAdminBranchKpi {
  branchId: string;
  branchName: string;
  students: number;
  faculty: number;
  /** Student attendance % for the branch. */
  attendancePercent: number;
  /** Faculty staff-attendance % for the branch (current month). */
  facultyAttendancePercent: number;
  feeCollected: number;
  feeDue: number;
}

export type SuperAdminAlertSeverity = "info" | "warning" | "critical";
export type SuperAdminAlertType = "attendance" | "fees" | "pending_actions" | "system";

export interface SuperAdminAlert {
  id: string;
  severity: SuperAdminAlertSeverity;
  type: SuperAdminAlertType;
  branchId: string | null;
  title: string;
  message: string;
  createdAt: string;
}

export interface SuperAdminDashboardData {
  branchesCount: number;
  totalStudents: number;
  totalFaculty: number;
  overallAttendancePercent: number;
  totalFeeCollected: number;
  totalFeeDue: number;
  branchKpis: SuperAdminBranchKpi[];
  alerts: SuperAdminAlert[];
}

export type SuperAdminAcademicYearStatus = "upcoming" | "in_progress" | "ended";

export interface SuperAdminAcademicYearOverviewRow {
  branchId: string;
  branchName: string;
  academicYearLabel: string;
  startDate: string;
  endDate: string;
  status: SuperAdminAcademicYearStatus;
  daysRemaining: number | null;
  percentElapsed: number;
}

export interface SuperAdminAcademicYearOverviewData {
  rows: SuperAdminAcademicYearOverviewRow[];
  generatedAt: string;
}

export type SuperAdminTransferStatus = "completed" | "in_review" | "needs_action";

/** F-155 — fee dues after inter-branch transfer */
export interface SuperAdminTransferFeeSnapshot {
  /** Open balance retained on the archived (source) branch ledger */
  sourceBranchOpenDue: number;
  /** Open balance on the active (destination) branch ledger only */
  destinationBranchOpenDue: number;
  /** Policy flag: prior-branch dues are never moved to destination */
  duesRemainInSourceLedger: true;
}

export interface SuperAdminStudentTransferRow {
  transferId: string;
  studentId: string;
  studentName: string;
  archivedFromBranchId: string;
  archivedFromBranchName: string;
  archivedAt: string;
  archivedAdmissionNo: string;
  enrolledToBranchId: string;
  enrolledToBranchName: string;
  enrolledAt: string;
  currentClassLabel: string;
  status: SuperAdminTransferStatus;
  notes: string | null;
  feeSnapshot: SuperAdminTransferFeeSnapshot;
}

export interface SuperAdminStudentTransferOversightData {
  rows: SuperAdminStudentTransferRow[];
  /** F-155 policy reminder for super-admin UI */
  feePolicyLabel: string;
  generatedAt: string;
}

export type SuperAdminBranchFeeLedgerEnrollmentStatus = "archived_at_branch" | "active_at_branch";

/** F-155 — per-branch fee ledger line (archived source vs active destination) */
export interface SuperAdminBranchFeeLedgerRow {
  ledgerId: string;
  branchId: string;
  branchName: string;
  studentId: string;
  studentName: string;
  transferId: string | null;
  enrollmentStatus: SuperAdminBranchFeeLedgerEnrollmentStatus;
  openDue: number;
  updatedAt: string;
}

export interface SuperAdminBranchFeeLedgerData {
  branchId: string;
  branchName: string;
  rows: SuperAdminBranchFeeLedgerRow[];
  totalOpenDue: number;
  generatedAt: string;
}

export interface SuperAdminRecordStudentTransferInput {
  studentId: string;
  studentName: string;
  fromBranchId: string;
  toBranchId: string;
  archivedAdmissionNo: string;
  currentClassLabel: string;
  /** Outstanding fees at source branch before transfer (stays on source ledger) */
  sourceBranchOpenDue: number;
  /** New fees at destination only; does not include source balance */
  destinationBranchOpenDue?: number;
  notes?: string;
}

export interface SuperAdminDefaulterBranchBreakdown {
  branchId: string;
  branchName: string;
  dueAmount: number;
}

export interface SuperAdminDefaulterRow {
  studentId: string;
  studentName: string;
  guardianName: string | null;
  totalDue: number;
  branches: SuperAdminDefaulterBranchBreakdown[];
  lastPaymentAt: string | null;
}

export interface SuperAdminDefaulterReportData {
  rows: SuperAdminDefaulterRow[];
  totalDue: number;
  branchesTotalDue: SuperAdminDefaulterBranchBreakdown[];
  generatedAt: string;
}

export interface SuperAdminBranchResultMetrics {
  branchId: string;
  branchName: string;
  examLabel: string;
  passPercent: number;
  appeared: number;
  passed: number;
  avgScorePercent: number;
  topScorePercent: number;
  dist: {
    distinction: number;
    firstClass: number;
    secondClass: number;
    fail: number;
  };
  updatedAt: string;
}

export interface SuperAdminResultsFilterOptions {
  branches: { branchId: string; branchName: string }[];
  exams: { examId: string; examLabel: string; branchId: string; branchName: string }[];
}

export interface SuperAdminResultsComparisonData {
  branches: SuperAdminBranchResultMetrics[];
  scoreBands: { band: string; count: number }[];
  filterOptions: SuperAdminResultsFilterOptions;
  selectedBranchId: string | null;
  selectedExamId: string | null;
  generatedAt: string;
}

export type SuperAdminExportJobStatus = "queued" | "running" | "completed" | "failed";

export interface SuperAdminExportJob {
  id: string;
  type: "branch_summary";
  status: SuperAdminExportJobStatus;
  progressPercent: number;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  error: string | null;
  downloadUrl: string | null;
}

export interface SuperAdminExportsData {
  jobs: SuperAdminExportJob[];
  generatedAt: string;
}

export interface SuperAdminBranch {
  id: string;
  name: string;
  code: string;
  city: string;
  isActive: boolean;
  createdAt: string;
  /** Geo-fence centre (F-103). Null when geo-fence is disabled. */
  latitude: number | null;
  longitude: number | null;
  geofenceRadiusM: number | null;
}

export interface UpdateSuperAdminBranchSettingsInput {
  latitude?: number | null;
  longitude?: number | null;
  geofenceRadiusM?: number | null;
}

export interface SuperAdminBranchesData {
  branches: SuperAdminBranch[];
}

export interface SuperAdminCreateBranchInput {
  name: string;
  code: string;
  city: string;
}

export interface SuperAdminBranchAdminUser {
  id: string;
  name: string;
  phone: string;
  branchId: string;
  branchName: string;
  isActive: boolean;
  lastLoginAt: string | null;
}

export interface SuperAdminAdminsData {
  admins: SuperAdminBranchAdminUser[];
  branches: { id: string; name: string }[];
}

export interface SuperAdminInviteAdminInput {
  name: string;
  phone: string;
  branchId: string;
}

export interface SuperAdminOperationsBranchOverview {
  branchId: string;
  branchName: string;
  code: string;
  city: string;
  isActive: boolean;
  admins: number;
  faculty: number;
  students: number;
  parents: number;
}

export interface SuperAdminOperationsOverviewData {
  branches: SuperAdminOperationsBranchOverview[];
  totals: {
    admins: number;
    faculty: number;
    students: number;
    parents: number;
  };
}

export type SuperAdminPlanTier = "standard" | "ai";

export interface SuperAdminCurrentPlan {
  tier: SuperAdminPlanTier;
  billingCycle: "monthly" | "annual";
  priceInrPerMonth: number;
  startedAt: string;
  renewsAt: string;
  limits: {
    branches: number;
    students: number;
    storageGb: number;
  };
  features: string[];
}

export type SuperAdminUpgradeRequestStatus = "submitted" | "in_review" | "approved" | "rejected";

export interface SuperAdminUpgradeRequest {
  id: string;
  requestedTier: SuperAdminPlanTier;
  requestedBillingCycle: "monthly" | "annual";
  notes: string;
  status: SuperAdminUpgradeRequestStatus;
  createdAt: string;
  updatedAt: string;
  resolvedMessage: string | null;
}

export interface SuperAdminPlanData {
  current: SuperAdminCurrentPlan;
  requests: SuperAdminUpgradeRequest[];
}

export interface SuperAdminCreateUpgradeRequestInput {
  requestedTier: SuperAdminPlanTier;
  requestedBillingCycle: "monthly" | "annual";
  notes: string;
}

export type SuperAdminTicketSeverity = "low" | "medium" | "high" | "critical";
export type SuperAdminTicketStatus = "open" | "in_progress" | "waiting_on_institution" | "resolved" | "closed";

export interface SuperAdminTicketComment {
  id: string;
  authorRole: "super_admin" | "platform_owner";
  authorName: string;
  message: string;
  createdAt: string;
}

export interface SuperAdminTicket {
  id: string;
  title: string;
  severity: SuperAdminTicketSeverity;
  status: SuperAdminTicketStatus;
  category: "bug" | "data_issue" | "billing" | "access" | "other";
  description: string;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
  comments: SuperAdminTicketComment[];
}

export interface SuperAdminTicketsData {
  tickets: SuperAdminTicket[];
}

export interface SuperAdminCreateTicketInput {
  title: string;
  category: SuperAdminTicket["category"];
  severity: SuperAdminTicketSeverity;
  description: string;
}

export interface SuperAdminTicketActionInput {
  action: "add_comment" | "set_status" | "add_platform_note";
  ticketId: string;
  message?: string;
  status?: SuperAdminTicketStatus;
  authorName?: string;
}

export interface SuperAdminNotificationPrefs {
  email: boolean;
  sms: boolean;
  inApp: boolean;
  digest: "off" | "daily" | "weekly";
}

export interface SuperAdminProfileData {
  userId: string;
  name: string;
  phone: string | null;
  ownPhone: string | null;
}

export interface UpdateSuperAdminProfileInput {
  name: string;
  ownPhone: string;
}

export interface ChangeSuperAdminPasswordInput {
  currentPassword: string;
  newPassword: string;
}

export type FeeTemplateScope = "tuition" | "hostel" | "transport" | "exam" | "other";

export interface FeeTemplateLineItem {
  id: string;
  label: string;
  amount: number;
  mandatory: boolean;
}

export interface FeeStructureTemplate {
  id: string;
  name: string;
  scope: FeeTemplateScope;
  currency: "INR";
  academicYearLabel: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  items: FeeTemplateLineItem[];
}

export interface FeeStructureTemplatesData {
  templates: FeeStructureTemplate[];
}

export interface CreateFeeStructureTemplateInput {
  name: string;
  scope: FeeTemplateScope;
  academicYearLabel: string;
  items: Array<{ label: string; amount: number; mandatory: boolean }>;
}

export interface FeeBranchOverride {
  branchId: string;
  templateId: string;
  items: FeeTemplateLineItem[];
  updatedAt: string;
}

export interface FeeBranchOverridesData {
  branches: { id: string; name: string }[];
  templates: { id: string; name: string; scope: FeeTemplateScope; academicYearLabel: string }[];
  overrides: FeeBranchOverride[];
}

export interface UpdateFeeBranchOverrideInput {
  branchId: string;
  templateId: string;
  items: Array<{ id?: string; label: string; amount: number; mandatory: boolean }>;
}

export type SuperAdminAnnouncementTarget =
  | { type: "all" }
  | { type: "branches"; branchIds: string[] };

export interface SuperAdminBroadcastAnnouncement {
  id: string;
  title: string;
  body: string;
  channels: ("in_app" | "sms" | "email")[];
  target: SuperAdminAnnouncementTarget;
  createdAt: string;
  createdBy: string;
}

export interface SuperAdminAnnouncementsData {
  branches: { id: string; name: string }[];
  announcements: SuperAdminBroadcastAnnouncement[];
}

export interface CreateSuperAdminAnnouncementInput {
  title: string;
  body: string;
  channels: ("in_app" | "sms" | "email")[];
  target: SuperAdminAnnouncementTarget;
}

