/**
 * Platform-owner data — Django backend boundary (tenants, subdomain check).
 */

import {
  PLATFORM_SUBDOMAIN_MAX_LENGTH,
  PLATFORM_SUBDOMAIN_MIN_LENGTH,
  PLATFORM_SUBDOMAIN_PATTERN,
} from "@eduos/constants";
import type {
  CreatePlatformTenantInput,
  PlatformAnalyticsData,
  PlatformChangePlanInput,
  PlatformChangePlanResult,
  PlatformEnterSupportInput,
  PlatformGlobalAnnouncement,
  PlatformMaintenanceMode,
  PlatformOwnerDashboardData,
  PlatformPlanDefinition,
  PlatformPlanFeatureMatrixData,
  PlatformPlanLimitBlockedResponse,
  PlatformPlatformStats,
  PlatformRevenueReport,
  PlatformStudentSubscriptionActionInput,
  PlatformStudentSubscriptionActionResult,
  PlatformStudentSubscriptionListData,
  PlatformStudentSubscriptionListFilters,
  PlatformSupportActionResult,
  PlatformSupportModeData,
  PlatformTenantListData,
  PlatformTenantListFilters,
  PlatformTenantPlan,
  PlatformTenantStatusActionInput,
  PlatformTenantSummary,
  PlatformTicket,
  PlatformTicketActionInput,
  PlatformTrialActionInput,
  PublishPlatformAnnouncementInput,
  SubdomainAvailabilityResult,
  UpdatePlatformMaintenanceInput,
  UpdatePlatformPlanDefinitionInput,
  UpdatePlatformPlanFeatureMatrixInput,
  ValidatePlatformPlanLimitsInput,
} from "@eduos/types";
import { getApiBaseUrl } from "@/lib/config";

export class PlatformPlanLimitError extends Error {
  readonly payload: PlatformPlanLimitBlockedResponse;

  constructor(payload: PlatformPlanLimitBlockedResponse) {
    super(payload.detail);
    this.name = "PlatformPlanLimitError";
    this.payload = payload;
  }
}

async function djangoFetch<T>(
  accessToken: string,
  path: string,
  init?: RequestInit,
): Promise<{ ok: true; data: T } | { ok: false; status: number; message: string; body: unknown }> {
  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...init?.headers,
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      (typeof body === "object" && body && "message" in body && String(body.message)) ||
      (typeof body === "object" &&
        body &&
        "errors" in body &&
        typeof body.errors === "object" &&
        body.errors &&
        "error" in body.errors &&
        String((body.errors as { error: string }).error)) ||
      (typeof body === "object" && body && "error" in body && String((body as { error: string }).error)) ||
      "Request failed";
    return { ok: false, status: res.status, message, body };
  }
  const data =
    typeof body === "object" && body && "data" in body ? (body.data as T) : (body as T);
  return { ok: true, data };
}

function slugifySubdomain(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, PLATFORM_SUBDOMAIN_MAX_LENGTH);
}

function normalizeSubdomainInput(raw: string, fallbackName?: string): string {
  const trimmed = raw.trim().toLowerCase();
  if (trimmed) return trimmed;
  if (fallbackName) return slugifySubdomain(fallbackName);
  return "";
}

function invalidSubdomainResult(subdomain: string, message: string): SubdomainAvailabilityResult {
  return { subdomain, available: false, reason: "invalid", message };
}

function mapDjangoSubdomainCheck(
  subdomain: string,
  django: { available: boolean; valid: boolean },
): SubdomainAvailabilityResult {
  if (!subdomain) {
    return invalidSubdomainResult("", "Enter a subdomain or institution name to generate one.");
  }
  if (
    !django.valid ||
    subdomain.length < PLATFORM_SUBDOMAIN_MIN_LENGTH ||
    subdomain.length > PLATFORM_SUBDOMAIN_MAX_LENGTH ||
    !PLATFORM_SUBDOMAIN_PATTERN.test(subdomain)
  ) {
    return invalidSubdomainResult(
      subdomain,
      `Use ${PLATFORM_SUBDOMAIN_MIN_LENGTH}–${PLATFORM_SUBDOMAIN_MAX_LENGTH} lowercase letters, numbers, and hyphens (not at the ends).`,
    );
  }
  if (!django.available) {
    return {
      subdomain,
      available: false,
      reason: "taken",
      message: `"${subdomain}" is already registered. Choose another subdomain.`,
    };
  }
  return {
    subdomain,
    available: true,
    reason: "available",
    message: `"${subdomain}" is available.`,
  };
}

/** Backend expects invite.*; wizard collects super admin under branches.assignees. */
export function toDjangoCreatePayload(input: CreatePlatformTenantInput): CreatePlatformTenantInput {
  const superAdmin = input.branches?.entries
    ?.flatMap((entry) => entry.assignees ?? [])
    .find((a) => a.role === "super_admin" && a.name.trim() && a.phone.trim());

  return {
    ...input,
    invite: {
      superAdminName: superAdmin?.name.trim() || input.invite.superAdminName.trim(),
      superAdminPhone: superAdmin?.phone.trim() || input.invite.superAdminPhone.trim(),
    },
  };
}

function tenantListQuery(filters: PlatformTenantListFilters): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.plan && filters.plan !== "all") params.set("plan", filters.plan);
  if (filters.institutionType && filters.institutionType !== "all") {
    params.set("type", filters.institutionType);
  }
  if (filters.city && filters.city !== "all") params.set("city", filters.city);
  if (filters.status && filters.status !== "all") params.set("status", filters.status);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export async function checkSubdomainAvailability(
  accessToken: string,
  raw: string,
  fallbackName?: string,
): Promise<SubdomainAvailabilityResult> {
  const subdomain = normalizeSubdomainInput(raw, fallbackName);
  if (!subdomain) {
    return invalidSubdomainResult("", "Enter a subdomain or institution name to generate one.");
  }

  const result = await djangoFetch<{ available: boolean; valid: boolean }>(
    accessToken,
    `/api/v1/organizations/subdomain-check/?q=${encodeURIComponent(subdomain)}`,
  );
  if (!result.ok) {
    return invalidSubdomainResult(subdomain, result.message);
  }
  return mapDjangoSubdomainCheck(subdomain, result.data);
}

export async function listTenants(
  accessToken: string,
  filters: PlatformTenantListFilters,
): Promise<PlatformTenantListData> {
  const result = await djangoFetch<PlatformTenantListData>(
    accessToken,
    `/api/v1/organizations/platform/tenants/${tenantListQuery(filters)}`,
  );
  if (!result.ok) throw new Error(result.message);
  return result.data;
}

export async function createTenant(
  accessToken: string,
  input: CreatePlatformTenantInput,
): Promise<PlatformTenantSummary> {
  const payload = toDjangoCreatePayload(input);
  const result = await djangoFetch<{ tenant: PlatformTenantSummary }>(
    accessToken,
    "/api/v1/organizations/platform/tenants/",
    { method: "POST", body: JSON.stringify(payload) },
  );
  if (!result.ok) throw new Error(result.message);
  return result.data.tenant;
}

export async function getTenant(
  accessToken: string,
  id: string,
): Promise<PlatformTenantSummary | null> {
  const result = await djangoFetch<{ tenant: PlatformTenantSummary }>(
    accessToken,
    `/api/v1/organizations/platform/tenants/${id}/`,
  );
  if (!result.ok && result.status === 404) return null;
  if (!result.ok) throw new Error(result.message);
  return result.data.tenant;
}

export async function setTenantStatus(
  accessToken: string,
  input: PlatformTenantStatusActionInput,
): Promise<{
  tenant: PlatformTenantSummary;
  sessionsTerminated?: number;
  message?: string;
}> {
  const result = await djangoFetch<{
    tenant: PlatformTenantSummary;
    sessionsTerminated?: number;
    message?: string;
  }>(accessToken, "/api/v1/organizations/platform/tenants/actions/", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  if (!result.ok) throw new Error(result.message);
  return result.data;
}

const PLAN_ORDER: PlatformTenantPlan[] = ["standard", "ai"];

function tenantAnnualInr(t: PlatformTenantSummary): number {
  if (typeof t.annualSubscriptionInr === "number") return t.annualSubscriptionInr;
  const rate = t.unitPricePerStudentInr ?? 0;
  return t.studentCount * rate;
}

function tenantCollectedInr(t: PlatformTenantSummary): number {
  if (typeof t.collectedSubscriptionInr === "number") return t.collectedSubscriptionInr;
  return t.billingStatus === "paid" ? tenantAnnualInr(t) : 0;
}

function computePlatformStats(tenants: PlatformTenantSummary[]): PlatformPlatformStats {
  const billingStats = { paid: 0, overdue: 0, trial: 0 };
  let totalStudents = 0;
  let annualSubscriptionInr = 0;
  let collectedSubscriptionInr = 0;
  for (const t of tenants) {
    totalStudents += t.studentCount;
    annualSubscriptionInr += tenantAnnualInr(t);
    collectedSubscriptionInr += tenantCollectedInr(t);
    const bs = t.billingStatus ?? "trial";
    if (bs === "paid") billingStats.paid += 1;
    else if (bs === "overdue") billingStats.overdue += 1;
    else billingStats.trial += 1;
  }
  return { totalStudents, annualSubscriptionInr, collectedSubscriptionInr, billingStats };
}

function buildCollectedTrend(totalCollectedInr: number): { month: string; mrrInr: number }[] {
  const trend: { month: string; mrrInr: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = d.toLocaleString("en-IN", { month: "short", year: "numeric" });
    const factor = 0.75 + (5 - i) * 0.05;
    trend.push({ month, mrrInr: Math.round(totalCollectedInr * factor) });
  }
  if (trend.length > 0) {
    trend[trend.length - 1]!.mrrInr = totalCollectedInr;
  }
  return trend;
}

function buildSignupTrend(tenants: PlatformTenantSummary[]): { month: string; count: number }[] {
  const now = new Date();
  const trend: { month: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
    const month = monthStart.toLocaleString("en-IN", { month: "short", year: "numeric" });
    const count = tenants.filter((t) => {
      const created = new Date(t.createdAt);
      return created >= monthStart && created <= monthEnd;
    }).length;
    trend.push({ month, count });
  }
  return trend;
}

function buildAnalyticsFromTenantList(list: PlatformTenantListData): PlatformAnalyticsData {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const signups = [...list.tenants]
    .filter((t) => new Date(t.createdAt) >= monthStart)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return {
    totalInstitutions: list.stats.total,
    activeCount: list.stats.active,
    inactiveCount: list.stats.inactive,
    pendingCount: list.stats.pending,
    planDistribution: PLAN_ORDER.map((plan) => ({
      plan,
      count: list.tenants.filter((t) => t.plan === plan).length,
    })),
    signupTrend: buildSignupTrend(list.tenants),
    newSignupsThisMonth: signups.length,
    recentSignups: signups.map((t) => ({
      tenantId: t.id,
      name: t.name,
      subdomain: t.subdomain,
      plan: t.plan,
      createdAt: t.createdAt,
    })),
  };
}

function buildDashboardFromTenantList(list: PlatformTenantListData): PlatformOwnerDashboardData {
  const platformStats = list.platformStats ?? computePlatformStats(list.tenants);
  const revenueByPlan = PLAN_ORDER.map((plan) => {
    const onPlan = list.tenants.filter((t) => t.plan === plan);
    const annualSubscriptionInr = onPlan.reduce((sum, t) => sum + tenantAnnualInr(t), 0);
    return {
      plan,
      mrrInr: annualSubscriptionInr,
      annualSubscriptionInr,
    };
  });
  const planDistribution = PLAN_ORDER.map((plan) => ({
    plan,
    count: list.tenants.filter((t) => t.plan === plan).length,
  }));

  return {
    stats: list.stats,
    platformStats,
    mrrInr: platformStats.collectedSubscriptionInr,
    mrrTrend: buildCollectedTrend(platformStats.collectedSubscriptionInr),
    revenueByPlan,
    statusDistribution: [
      { status: "active", count: list.stats.active },
      { status: "inactive", count: list.stats.inactive },
    ],
    signupTrend: buildSignupTrend(list.tenants),
    recentTenants: [...list.tenants]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 5),
    planDistribution,
  };
}

function buildRevenueReportFromList(list: PlatformTenantListData): PlatformRevenueReport {
  const platformStats = list.platformStats ?? computePlatformStats(list.tenants);
  const plans = PLAN_ORDER;
  const byPlan = plans.map((plan) => {
    const onPlan = list.tenants.filter((t) => t.plan === plan);
    const paying = onPlan.filter((t) => t.billingStatus === "paid" || t.billingStatus === "overdue");
    const trial = onPlan.filter((t) => (t.billingStatus ?? "trial") === "trial");
    const annualInr = onPlan.reduce((sum, t) => sum + tenantAnnualInr(t), 0);
    return {
      plan,
      label: plan.charAt(0).toUpperCase() + plan.slice(1),
      payingTenants: paying.length,
      trialTenants: trial.length,
      mrrInr: annualInr,
      percentOfMrr: 0,
    };
  });
  const totalAnnual = platformStats.annualSubscriptionInr;
  for (const row of byPlan) {
    row.percentOfMrr = totalAnnual > 0 ? Math.round((row.mrrInr / totalAnnual) * 1000) / 10 : 0;
  }
  const billing = platformStats.billingStats;
  return {
    asOf: new Date().toISOString(),
    currency: "INR",
    totalMrrInr: platformStats.collectedSubscriptionInr,
    arrInr: platformStats.annualSubscriptionInr,
    payingTenantCount: billing.paid,
    trialTenantCount: billing.trial,
    overdueTenantCount: billing.overdue,
    totalStudents: platformStats.totalStudents,
    annualSubscriptionInr: platformStats.annualSubscriptionInr,
    collectedSubscriptionInr: platformStats.collectedSubscriptionInr,
    paymentDataNote: "Per-student annual subscription fees only — no card or bank account data is stored.",
    byPlan,
    mrrTrend: buildCollectedTrend(platformStats.collectedSubscriptionInr),
  };
}

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function buildTenantsExportCsvFromList(list: PlatformTenantListData): string {
  const header = [
    "tenant_id",
    "institution_name",
    "subdomain",
    "plan",
    "institution_type",
    "city",
    "state",
    "status",
    "super_admin_name",
    "super_admin_phone",
    "created_at",
    "branch_count",
    "student_count",
    "active_sessions",
    "billing_status",
    "annual_subscription_inr",
    "collected_subscription_inr",
  ];
  const lines = list.tenants.map((t) =>
    [
      t.id,
      t.name,
      t.subdomain,
      t.plan,
      t.institutionType,
      t.city,
      t.state,
      t.status,
      t.superAdminName,
      t.superAdminPhone,
      t.createdAt,
      String(t.branchCount),
      String(t.studentCount),
      String(t.activeSessions),
      t.billingStatus ?? "trial",
      String(tenantAnnualInr(t)),
      String(tenantCollectedInr(t)),
    ]
      .map((v) => csvEscape(String(v)))
      .join(","),
  );
  return [header.join(","), ...lines].join("\n");
}

export async function getDashboard(accessToken: string) {
  const list = await listTenants(accessToken, {});
  return buildDashboardFromTenantList(list);
}

export async function getAnalytics(accessToken: string): Promise<PlatformAnalyticsData> {
  const list = await listTenants(accessToken, {});
  return buildAnalyticsFromTenantList(list);
}

export async function getRevenueReport(accessToken: string): Promise<PlatformRevenueReport> {
  const list = await listTenants(accessToken, {});
  return buildRevenueReportFromList(list);
}

export async function getAuditLogs(accessToken: string) {
  const result = await djangoFetch<import("@eduos/types").PlatformAuditData>(
    accessToken,
    "/api/v1/organizations/platform/audit/",
  );
  if (!result.ok) throw new Error(result.message);
  return result.data;
}

export async function getTrials(accessToken: string) {
  const result = await djangoFetch<import("@eduos/types").PlatformTrialsData>(
    accessToken,
    "/api/v1/organizations/platform/trials/",
  );
  if (!result.ok) throw new Error(result.message);
  return result.data;
}

export async function applyTrialAction(accessToken: string, input: PlatformTrialActionInput) {
  const result = await djangoFetch<{ message: string; pipeline?: unknown; trials?: unknown }>(
    accessToken,
    "/api/v1/organizations/platform/trials/actions/",
    { method: "POST", body: JSON.stringify(input) },
  );
  if (!result.ok) throw new Error(result.message);
  return result.data;
}

export async function listAllTickets(accessToken: string) {
  const result = await djangoFetch<import("@eduos/types").PlatformTicketsData>(
    accessToken,
    "/api/v1/organizations/platform/tickets/",
  );
  if (!result.ok) throw new Error(result.message);
  return result.data;
}

export async function applyTicketAction(
  accessToken: string,
  input: PlatformTicketActionInput,
): Promise<PlatformTicket> {
  const result = await djangoFetch<{ ticket: PlatformTicket }>(
    accessToken,
    "/api/v1/organizations/platform/tickets/actions/",
    { method: "PATCH", body: JSON.stringify(input) },
  );
  if (!result.ok) throw new Error(result.message);
  return result.data.ticket;
}

export async function getSupportMode(accessToken: string): Promise<PlatformSupportModeData> {
  const result = await djangoFetch<PlatformSupportModeData>(
    accessToken,
    "/api/v1/organizations/platform/support/",
  );
  if (!result.ok) throw new Error(result.message);
  return result.data;
}

export async function enterSupportMode(
  accessToken: string,
  input: PlatformEnterSupportInput,
): Promise<PlatformSupportActionResult> {
  const result = await djangoFetch<PlatformSupportActionResult>(
    accessToken,
    "/api/v1/organizations/platform/support/",
    { method: "POST", body: JSON.stringify(input) },
  );
  if (!result.ok) throw new Error(result.message);
  return result.data;
}

export async function exitSupportMode(accessToken: string): Promise<PlatformSupportActionResult> {
  const result = await djangoFetch<PlatformSupportActionResult>(
    accessToken,
    "/api/v1/organizations/platform/support/",
    { method: "DELETE" },
  );
  if (!result.ok) throw new Error(result.message);
  return result.data;
}

export async function getSettings(accessToken: string) {
  const result = await djangoFetch<import("@eduos/types").PlatformSettingsData>(
    accessToken,
    "/api/v1/organizations/platform/settings/",
  );
  if (!result.ok) throw new Error(result.message);
  return result.data;
}

export async function setAnnouncementActive(
  accessToken: string,
  id: string,
  isActive: boolean,
): Promise<PlatformGlobalAnnouncement> {
  const result = await djangoFetch<{ announcement: PlatformGlobalAnnouncement }>(
    accessToken,
    "/api/v1/organizations/platform/settings/",
    { method: "PATCH", body: JSON.stringify({ type: "announcement_toggle", id, isActive }) },
  );
  if (!result.ok) throw new Error(result.message);
  return result.data.announcement;
}

export async function updatePlanDefinition(
  accessToken: string,
  input: UpdatePlatformPlanDefinitionInput,
): Promise<PlatformPlanDefinition> {
  const result = await djangoFetch<{ plan: PlatformPlanDefinition }>(
    accessToken,
    "/api/v1/organizations/platform/settings/",
    { method: "PATCH", body: JSON.stringify(input) },
  );
  if (!result.ok) throw new Error(result.message);
  return result.data.plan;
}

export async function publishAnnouncement(
  accessToken: string,
  input: PublishPlatformAnnouncementInput,
): Promise<PlatformGlobalAnnouncement> {
  const result = await djangoFetch<{ announcement: PlatformGlobalAnnouncement }>(
    accessToken,
    "/api/v1/organizations/platform/settings/",
    { method: "POST", body: JSON.stringify(input) },
  );
  if (!result.ok) throw new Error(result.message);
  return result.data.announcement;
}

export async function getPlansData(accessToken: string) {
  const result = await djangoFetch<import("@eduos/types").PlatformPlansData>(
    accessToken,
    "/api/v1/organizations/platform/plans/",
  );
  if (!result.ok) throw new Error(result.message);
  return result.data;
}

export async function changeTenantPlan(
  accessToken: string,
  input: PlatformChangePlanInput,
): Promise<PlatformChangePlanResult> {
  const result = await djangoFetch<PlatformChangePlanResult>(
    accessToken,
    "/api/v1/organizations/platform/plans/",
    { method: "PATCH", body: JSON.stringify(input) },
  );
  if (!result.ok) {
    if (
      result.status === 409 &&
      typeof result.body === "object" &&
      result.body !== null &&
      "limitBlocked" in result.body
    ) {
      throw new PlatformPlanLimitError(result.body as PlatformPlanLimitBlockedResponse);
    }
    throw new Error(result.message);
  }
  return result.data;
}

export async function validatePlanLimits(
  accessToken: string,
  input: ValidatePlatformPlanLimitsInput,
): Promise<{ ok: true } | PlatformPlanLimitBlockedResponse> {
  if (input.context !== "plan_downgrade" || !input.tenantId || !input.newPlan) {
    return { ok: true };
  }
  const result = await djangoFetch<{ ok: true }>(
    accessToken,
    "/api/v1/organizations/platform/plan-limits/validate/",
    { method: "POST", body: JSON.stringify(input) },
  );
  if (!result.ok) {
    if (
      result.status === 409 &&
      typeof result.body === "object" &&
      result.body !== null &&
      "limitBlocked" in result.body
    ) {
      return result.body as PlatformPlanLimitBlockedResponse;
    }
    return { ok: true };
  }
  return result.data;
}

export async function getPlanFeatureMatrix(accessToken: string): Promise<PlatformPlanFeatureMatrixData> {
  const result = await djangoFetch<PlatformPlanFeatureMatrixData>(
    accessToken,
    "/api/v1/organizations/platform/plan-features/",
  );
  if (!result.ok) throw new Error(result.message);
  return result.data;
}

export async function updatePlanFeatureMatrix(
  accessToken: string,
  input: UpdatePlatformPlanFeatureMatrixInput,
): Promise<PlatformPlanFeatureMatrixData> {
  const result = await djangoFetch<PlatformPlanFeatureMatrixData>(
    accessToken,
    "/api/v1/organizations/platform/plan-features/",
    { method: "PATCH", body: JSON.stringify(input) },
  );
  if (!result.ok) throw new Error(result.message);
  return result.data;
}

export async function getMaintenanceMode(accessToken: string): Promise<PlatformMaintenanceMode> {
  const result = await djangoFetch<{ maintenance: PlatformMaintenanceMode }>(
    accessToken,
    "/api/v1/organizations/platform/maintenance/",
  );
  if (!result.ok) throw new Error(result.message);
  return result.data.maintenance;
}

export async function updateMaintenanceMode(
  accessToken: string,
  input: UpdatePlatformMaintenanceInput,
): Promise<PlatformMaintenanceMode> {
  const result = await djangoFetch<{ maintenance: PlatformMaintenanceMode }>(
    accessToken,
    "/api/v1/organizations/platform/maintenance/",
    { method: "PATCH", body: JSON.stringify(input) },
  );
  if (!result.ok) throw new Error(result.message);
  return result.data.maintenance;
}

export async function getIntegrationHealth(accessToken: string) {
  const result = await djangoFetch<import("@eduos/types").PlatformIntegrationHealthData>(
    accessToken,
    "/api/v1/organizations/platform/integrations/health/",
  );
  if (!result.ok) throw new Error(result.message);
  return result.data;
}

export async function exportTenantsCsv(
  accessToken: string,
  filters: PlatformTenantListFilters,
): Promise<string> {
  const list = await listTenants(accessToken, filters);
  return buildTenantsExportCsvFromList(list);
}

function studentSubscriptionQuery(
  filters: PlatformStudentSubscriptionListFilters,
  skipMeta = false,
): string {
  const params = new URLSearchParams();
  if (filters.tenantId) params.set("tenantId", filters.tenantId);
  if (filters.branchId) params.set("branchId", filters.branchId);
  if (filters.plan && filters.plan !== "all") params.set("plan", filters.plan);
  if (filters.status && filters.status !== "all") params.set("status", filters.status);
  if (filters.q) params.set("q", filters.q);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize));
  if (skipMeta) params.set("skipMeta", "1");
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export async function listStudentSubscriptions(
  accessToken: string,
  filters: PlatformStudentSubscriptionListFilters,
  skipMeta = false,
): Promise<PlatformStudentSubscriptionListData> {
  const result = await djangoFetch<PlatformStudentSubscriptionListData>(
    accessToken,
    `/api/v1/organizations/platform/student-subscriptions/${studentSubscriptionQuery(filters, skipMeta)}`,
  );
  if (!result.ok) throw new Error(result.message);
  return result.data;
}

export async function applyStudentSubscriptionAction(
  accessToken: string,
  input: PlatformStudentSubscriptionActionInput,
): Promise<PlatformStudentSubscriptionActionResult> {
  const result = await djangoFetch<PlatformStudentSubscriptionActionResult>(
    accessToken,
    "/api/v1/organizations/platform/student-subscriptions/actions/",
    { method: "PATCH", body: JSON.stringify(input) },
  );
  if (!result.ok) throw new Error(result.message);
  return result.data;
}

// ── Licensing (non-recyclable per-student licenses) ──────────────────────────

export async function getLicensingOverview(
  accessToken: string,
): Promise<import("@eduos/types").PlatformLicensingOverview> {
  const result = await djangoFetch<import("@eduos/types").PlatformLicensingOverview>(
    accessToken,
    "/api/v1/organizations/platform/licensing/overview/",
  );
  if (!result.ok) throw new Error(result.message);
  return result.data;
}

export async function getLicensingTenantDetail(
  accessToken: string,
  tenantId: string,
  branchId?: string | null,
): Promise<import("@eduos/types").PlatformLicensingTenantDetail> {
  const qs = branchId ? `?branchId=${encodeURIComponent(branchId)}` : "";
  const result = await djangoFetch<import("@eduos/types").PlatformLicensingTenantDetail>(
    accessToken,
    `/api/v1/organizations/platform/licensing/tenants/${tenantId}${qs}`,
  );
  if (!result.ok) throw new Error(result.message);
  return result.data;
}

export async function updateTenantPricing(
  accessToken: string,
  tenantId: string,
  discountPercent: number,
): Promise<import("@eduos/types").PlatformTenantPricing> {
  const result = await djangoFetch<{ pricing: import("@eduos/types").PlatformTenantPricing }>(
    accessToken,
    `/api/v1/organizations/platform/licensing/tenants/${tenantId}/pricing/`,
    {
      method: "PATCH",
      body: JSON.stringify({ discountPercent }),
    },
  );
  if (!result.ok) throw new Error(result.message);
  return result.data.pricing;
}

export async function listLicensePayments(
  accessToken: string,
  tenantId?: string,
): Promise<{ payments: import("@eduos/types").LicensePaymentRecord[] }> {
  const qs = tenantId ? `?tenantId=${encodeURIComponent(tenantId)}` : "";
  const result = await djangoFetch<{ payments: import("@eduos/types").LicensePaymentRecord[] }>(
    accessToken,
    `/api/v1/organizations/platform/licensing/payments/${qs}`,
  );
  if (!result.ok) throw new Error(result.message);
  return result.data;
}

export async function recordLicensePayment(
  accessToken: string,
  input: import("@eduos/types").RecordLicensePaymentInput,
): Promise<{
  payment: import("@eduos/types").LicensePaymentRecord;
  summary: import("@eduos/types").LicenseSummary;
}> {
  const result = await djangoFetch<{
    payment: import("@eduos/types").LicensePaymentRecord;
    summary: import("@eduos/types").LicenseSummary;
  }>(accessToken, "/api/v1/organizations/platform/licensing/payments/", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!result.ok) throw new Error(result.message);
  return result.data;
}

export async function generateLicenseInvoice(
  accessToken: string,
  input: import("@eduos/types").GenerateLicenseInvoiceInput,
): Promise<{ invoice: import("@eduos/types").LicenseInvoiceRecord }> {
  const result = await djangoFetch<{ invoice: import("@eduos/types").LicenseInvoiceRecord }>(
    accessToken,
    "/api/v1/organizations/platform/licensing/invoices/",
    { method: "POST", body: JSON.stringify(input) },
  );
  if (!result.ok) throw new Error(result.message);
  return result.data;
}

export async function extendLicensePeriod(
  accessToken: string,
  periodId: string,
  endDate: string,
): Promise<{ period: import("@eduos/types").LicensePeriod }> {
  const result = await djangoFetch<{ period: import("@eduos/types").LicensePeriod }>(
    accessToken,
    `/api/v1/organizations/platform/licensing/periods/${periodId}/`,
    { method: "PATCH", body: JSON.stringify({ endDate }) },
  );
  if (!result.ok) throw new Error(result.message);
  return result.data;
}
