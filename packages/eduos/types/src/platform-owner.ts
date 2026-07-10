import type { SuperAdminTicket, SuperAdminTicketStatus } from "./super-admin";

export type PlatformTenantPlan = "standard" | "ai";
export type PlatformTenantStatus = "active" | "inactive" | "pending";
export type PlatformInstitutionType = "school" | "college";

export interface PlatformTenantSummary {
  id: string;
  name: string;
  subdomain: string;
  plan: PlatformTenantPlan;
  institutionType: PlatformInstitutionType;
  city: string;
  state: string;
  status: PlatformTenantStatus;
  superAdminName: string;
  superAdminPhone: string;
  createdAt: string;
  branchCount: number;
  studentCount: number;
  activeSessions: number;
  billingStatus?: PlatformBillingStatus;
  annualSubscriptionInr?: number;
  collectedSubscriptionInr?: number;
  amountDueInr?: number;
  listPricePerStudentInr?: number;
  discountPercent?: number;
  unitPricePerStudentInr?: number;
}

export interface PlatformPlatformStats {
  totalStudents: number;
  annualSubscriptionInr: number;
  collectedSubscriptionInr: number;
  billingStats: { paid: number; overdue: number; trial: number };
}

export interface PlatformTenantPricing {
  plan: PlatformTenantPlan;
  listPricePerStudentInr: number;
  discountPercent: number;
  unitPricePerStudentInr: number;
}

export interface UpdatePlatformTenantPricingInput {
  discountPercent: number;
}

export interface PlatformTenantListFilters {
  plan?: PlatformTenantPlan | "all";
  institutionType?: PlatformInstitutionType | "all";
  city?: string;
  status?: PlatformTenantStatus | "all";
  q?: string;
}

export interface PlatformTenantListData {
  tenants: PlatformTenantSummary[];
  filterOptions: {
    cities: string[];
    plans: PlatformTenantPlan[];
    institutionTypes: PlatformInstitutionType[];
    statuses: PlatformTenantStatus[];
  };
  stats: {
    total: number;
    active: number;
    inactive: number;
    pending: number;
  };
  platformStats?: PlatformPlatformStats;
}

export interface PlatformOwnerDashboardData {
  stats: PlatformTenantListData["stats"];
  platformStats?: PlatformPlatformStats;
  mrrInr: number;
  mrrTrend: { month: string; mrrInr: number }[];
  revenueByPlan: { plan: PlatformTenantPlan; mrrInr: number; annualSubscriptionInr?: number }[];
  statusDistribution: { status: "active" | "inactive"; count: number }[];
  signupTrend: { month: string; count: number }[];
  recentTenants: PlatformTenantSummary[];
  planDistribution: { plan: PlatformTenantPlan; count: number }[];
}

export interface PlatformTenantWizardOverview {
  institutionName: string;
  subdomain: string;
  institutionType: PlatformInstitutionType;
  plan: PlatformTenantPlan;
}

export interface PlatformTenantWizardAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface PlatformTenantWizardInvite {
  superAdminName: string;
  superAdminPhone: string;
}

export interface PlatformTenantWizardFeatures {
  parentPortal: boolean;
  onlineFees: boolean;
  admissions: boolean;
  hrPayroll: boolean;
  examinations: boolean;
}

export interface PlatformTenantWizardIntegrations {
  razorpay: boolean;
  smsGateway: boolean;
  emailSmtp: boolean;
  googleWorkspace: boolean;
}

export interface PlatformTenantWizardBranches {
  /** City for the primary branch (used in tenant list). */
  hqCity: string;
  /** State for the primary branch (used in tenant list). */
  hqState: string;
  /** Branches to provision with optional role assignments. */
  entries: PlatformTenantWizardBranchEntry[];
}

export type PlatformTenantBranchStaffRole = "super_admin" | "admin";

export interface PlatformTenantWizardBranchRoleAssignee {
  role: PlatformTenantBranchStaffRole;
  name: string;
  phone: string;
}

export interface PlatformTenantWizardBranchEntry {
  name: string;
  assignees: PlatformTenantWizardBranchRoleAssignee[];
}

export interface CreatePlatformTenantInput {
  overview: PlatformTenantWizardOverview;
  address: PlatformTenantWizardAddress;
  invite: PlatformTenantWizardInvite;
  branches: PlatformTenantWizardBranches;
  features: PlatformTenantWizardFeatures;
  integrations: PlatformTenantWizardIntegrations;
}

/** F-011 — subdomain availability (DB unique index + reserved list) */
export type SubdomainAvailabilityReason = "available" | "taken" | "reserved" | "invalid";

export interface SubdomainAvailabilityResult {
  subdomain: string;
  available: boolean;
  reason: SubdomainAvailabilityReason;
  message: string;
}

/** F-012 — plan limit hit during a platform workflow */
export type PlatformPlanLimitKind = "branches" | "students" | "features";

export interface PlatformPlanLimitViolation {
  kind: PlatformPlanLimitKind;
  plan: PlatformTenantPlan;
  planLabel: string;
  message: string;
  maxBranches?: number;
  maxStudents?: number;
  branchCount?: number;
  studentCount?: number;
  disallowedFeatures?: string[];
}

export interface PlatformPlanLimitBlockedResponse {
  limitBlocked: true;
  title: string;
  detail: string;
  violation: PlatformPlanLimitViolation;
}

export interface ValidatePlatformPlanLimitsInput {
  context: "wizard_features" | "plan_downgrade";
  plan: PlatformTenantPlan;
  features?: PlatformTenantWizardFeatures;
  tenantId?: string;
  newPlan?: PlatformTenantPlan;
}

export interface PlatformTenantStatusActionInput {
  tenantId: string;
  action: "activate" | "deactivate";
}

export interface PlatformTenantStatusActionResult {
  tenant: PlatformTenantSummary;
  sessionsTerminated: number;
  message: string;
}

export type PlatformBillingStatus = "paid" | "overdue" | "trial";

export type PlatformStudentSubscriptionStatus = "paid" | "unpaid" | "overdue" | "waived";

export interface PlatformStudentSubscriptionRow {
  id: string;
  tenantId: string;
  tenantName: string;
  subdomain: string;
  branchId: string;
  branchName: string;
  studentUserId: string;
  studentName: string;
  loginId: string;
  plan: PlatformTenantPlan;
  academicYear: string;
  annualFeeInr: number;
  status: PlatformStudentSubscriptionStatus;
  paidAt: string | null;
}

export interface PlatformStudentSubscriptionListFilters {
  tenantId?: string;
  branchId?: string;
  plan?: PlatformTenantPlan | "all";
  status?: PlatformStudentSubscriptionStatus | "all";
  q?: string;
  page?: number;
  pageSize?: number;
}

export interface PlatformStudentSubscriptionListData {
  rows: PlatformStudentSubscriptionRow[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  filterOptions: {
    tenants: { id: string; name: string; subdomain: string }[];
    branches: { id: string; name: string; tenantId: string }[];
  };
  stats: {
    totalStudents: number;
    paid: number;
    unpaid: number;
    overdue: number;
    annualSubscriptionInr: number;
    collectedSubscriptionInr: number;
  };
}

export interface PlatformStudentSubscriptionActionInput {
  studentSubscriptionId: string;
  action: "mark_paid" | "mark_unpaid";
}

export interface PlatformStudentSubscriptionActionResult {
  row: PlatformStudentSubscriptionRow;
}

/** F-013 — stage in trial → grace → deactivate pipeline */
export type PlatformTrialPipelineStage = "active" | "grace" | "lapsed";

export interface PlatformTrialTenantRow {
  tenantId: string;
  tenantName: string;
  subdomain: string;
  city: string;
  status: PlatformTenantStatus;
  plan: PlatformTenantPlan;
  stage: PlatformTrialPipelineStage;
  trialStartedAt: string;
  trialEndsAt: string;
  graceEndsAt: string;
  daysRemaining: number | null;
}

export interface PlatformTrialsData {
  rows: PlatformTrialTenantRow[];
  stats: {
    active: number;
    grace: number;
    lapsed: number;
    total: number;
  };
  pipeline: {
    trialPeriodDays: number;
    gracePeriodDays: number;
  };
}

export interface PlatformTrialPipelineRunResult {
  processed: number;
  movedToGrace: number;
  deactivated: number;
  messages: string[];
}

export interface PlatformTrialActionInput {
  tenantId: string;
  action: "extend_trial" | "convert_to_paid" | "run_pipeline";
  /** Days to add when action is extend_trial */
  extendDays?: number;
}

export interface PlatformSupportSession {
  tenantId: string;
  tenantName: string;
  tenantSubdomain: string;
  readOnly: boolean;
  enteredAt: string;
}

/** @deprecated Use SupportModeLogEntry — kept for compatibility */
export type PlatformSupportAuditEntry = SupportModeLogEntry;

export interface SupportModeLogEntry {
  id: string;
  tenantSubdomain: string;
  tenantName: string;
  action: string;
  detail: string;
  readOnly: boolean;
  actorName: string;
  createdAt: string;
}

export type PlatformAuditCategory =
  | "support"
  | "plan"
  | "tenant"
  | "ticket"
  | "announcement"
  | "settings"
  | "billing";

export interface PlatformAuditLogEntry {
  id: string;
  category: PlatformAuditCategory;
  action: string;
  detail: string;
  actorName: string;
  tenantSubdomain?: string;
  tenantName?: string;
  createdAt: string;
}

export interface PlatformAuditData {
  supportModeLog: SupportModeLogEntry[];
  auditLog: PlatformAuditLogEntry[];
}

export interface PlatformSupportModeData {
  session: PlatformSupportSession | null;
  supportModeLog: SupportModeLogEntry[];
  tenants: Pick<PlatformTenantSummary, "id" | "name" | "subdomain" | "status">[];
}

export interface PlatformEnterSupportInput {
  tenantId: string;
  readOnly: boolean;
}

export interface PlatformSupportActionResult {
  session: PlatformSupportSession | null;
  supportModeLog: SupportModeLogEntry[];
  message: string;
}

export interface PlatformPlanDefinition {
  plan: PlatformTenantPlan;
  label: string;
  maxBranches: number;
  maxStudents: number;
  includedFeatures: string[];
  description: string;
  pricePerStudentInr: number;
  includedAiCreditsPerStudent: number;
  includesAi: boolean;
}

export type PlatformAnnouncementSeverity = "info" | "warning" | "critical";

export interface PlatformGlobalAnnouncement {
  id: string;
  title: string;
  body: string;
  severity: PlatformAnnouncementSeverity;
  publishedAt: string;
  publishedBy: string;
  isActive: boolean;
}

/** F-019 — platform-wide maintenance */
export interface PlatformMaintenanceMode {
  enabled: boolean;
  message: string;
  blockWrites: boolean;
  scheduledEndAt: string | null;
  updatedAt: string;
  updatedBy: string;
}

export interface UpdatePlatformMaintenanceInput {
  enabled: boolean;
  message?: string;
  blockWrites?: boolean;
  scheduledEndAt?: string | null;
}

export interface PlatformSettingsData {
  planDefinitions: PlatformPlanDefinition[];
  announcements: PlatformGlobalAnnouncement[];
  maintenance: PlatformMaintenanceMode;
}

/** F-020 — revenue aggregates (no payment card data) */
export interface PlatformRevenuePlanRow {
  plan: PlatformTenantPlan;
  label: string;
  payingTenants: number;
  trialTenants: number;
  mrrInr: number;
  percentOfMrr: number;
}

export interface PlatformRevenueReport {
  asOf: string;
  currency: "INR";
  totalMrrInr: number;
  arrInr: number;
  payingTenantCount: number;
  trialTenantCount: number;
  overdueTenantCount: number;
  /** Per-student annual subscription model */
  totalStudents?: number;
  annualSubscriptionInr?: number;
  collectedSubscriptionInr?: number;
  /** Explicit compliance note — card PAN/CVV never stored */
  paymentDataNote: string;
  byPlan: PlatformRevenuePlanRow[];
  /** Last 6 months mock MRR trend */
  mrrTrend: { month: string; mrrInr: number }[];
}

export interface UpdatePlatformPlanDefinitionInput {
  plan: PlatformTenantPlan;
  label?: string;
  maxBranches?: number;
  maxStudents?: number;
  includedFeatures?: string[];
  description?: string;
  pricePerStudentInr?: number;
  includedAiCreditsPerStudent?: number;
  includesAi?: boolean;
}

/** AI-only feature flags — core ERP modules are never gated by plan tier. */
export interface PlatformAiPlanFeatures {
  aiAssistant: boolean;
  aiInsights: boolean;
  aiReports: boolean;
  aiAnalytics: boolean;
  aiAutomation: boolean;
  predictiveAnalytics: boolean;
}

export type PlatformPlanFeatureKey = keyof PlatformAiPlanFeatures;

export interface PlatformPlanFeatureMatrixRow {
  plan: PlatformTenantPlan;
  label: string;
  flags: PlatformAiPlanFeatures;
}

export interface PlatformPlanFeatureMatrixData {
  featureCatalog: { key: PlatformPlanFeatureKey; label: string }[];
  rows: PlatformPlanFeatureMatrixRow[];
}

export interface UpdatePlatformPlanFeatureMatrixInput {
  plan: PlatformTenantPlan;
  flags: PlatformAiPlanFeatures;
}

export interface PublishPlatformAnnouncementInput {
  title: string;
  body: string;
  severity: PlatformAnnouncementSeverity;
}

export interface PlatformTicket extends SuperAdminTicket {
  tenantId: string;
  tenantName: string;
  tenantSubdomain: string;
}

export interface PlatformTicketsData {
  tickets: PlatformTicket[];
}

export interface PlatformTicketActionInput {
  tenantSubdomain: string;
  ticketId: string;
  action: "set_status" | "add_internal_note";
  status?: SuperAdminTicketStatus;
  message?: string;
}

export interface PlatformPlanLimits {
  plan: PlatformTenantPlan;
  label: string;
  pricePerStudentInr: number;
  includedAiCreditsPerStudent: number;
  includesAi: boolean;
  description?: string;
}

export interface PlatformTenantPlanRow {
  tenantId: string;
  tenantName: string;
  subdomain: string;
  status: PlatformTenantStatus;
  currentPlan: PlatformTenantPlan;
  branchCount: number;
  studentCount: number;
  restrictedFeatures: string[];
  overBranchLimit: boolean;
  overStudentLimit: boolean;
}

export interface PlatformPlansData {
  catalog: PlatformPlanLimits[];
  tenants: PlatformTenantPlanRow[];
}

export interface PlatformChangePlanInput {
  tenantId: string;
  newPlan: PlatformTenantPlan;
}

export interface PlatformChangePlanResult {
  tenant: PlatformTenantSummary;
  previousPlan: PlatformTenantPlan;
  newPlan: PlatformTenantPlan;
  restrictedFeatures: string[];
  message: string;
}

export interface PlatformAnalyticsSignup {
  tenantId: string;
  name: string;
  subdomain: string;
  plan: PlatformTenantPlan;
  createdAt: string;
}

/** F-015 — per-tenant integration connectivity */
export type PlatformIntegrationProvider = "razorpay" | "msg91" | "s3";

export type PlatformIntegrationHealthStatus =
  | "healthy"
  | "degraded"
  | "down"
  | "not_configured";

export interface PlatformIntegrationHealthCheck {
  provider: PlatformIntegrationProvider;
  status: PlatformIntegrationHealthStatus;
  message: string;
  enabled: boolean;
}

export interface PlatformTenantIntegrationHealthRow {
  tenantId: string;
  tenantName: string;
  subdomain: string;
  city: string;
  status: PlatformTenantStatus;
  razorpay: PlatformIntegrationHealthCheck;
  msg91: PlatformIntegrationHealthCheck;
  s3: PlatformIntegrationHealthCheck;
}

export interface PlatformIntegrationHealthData {
  checkedAt: string;
  rows: PlatformTenantIntegrationHealthRow[];
  stats: {
    healthy: number;
    degraded: number;
    down: number;
    notConfigured: number;
  };
}

export interface PlatformAnalyticsData {
  totalInstitutions: number;
  activeCount: number;
  inactiveCount: number;
  pendingCount: number;
  planDistribution: { plan: PlatformTenantPlan; count: number }[];
  signupTrend: { month: string; count: number }[];
  newSignupsThisMonth: number;
  recentSignups: PlatformAnalyticsSignup[];
}
