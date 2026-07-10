/**
 * Super-admin data — mock vs Django backend boundary.
 * Route handlers call these functions; they never branch on NEXT_PUBLIC_USE_MOCK directly.
 */

import { AuthError } from "./auth-server";
import type {
  AuthUser,
  ChangeSuperAdminPasswordInput,
  CreateFeeStructureTemplateInput,
  CreateSuperAdminAnnouncementInput,
  FeeBranchOverridesData,
  FeeStructureTemplate,
  FeeTemplateScope,
  SuperAdminAcademicYearOverviewData,
  SuperAdminAcademicYearOverviewRow,
  SuperAdminAcademicYearStatus,
  SuperAdminAlert,
  SuperAdminAnnouncementsData,
  SuperAdminBranchesData,
  SuperAdminBranch,
  SuperAdminBranchAdminUser,
  SuperAdminCreateBranchInput,
  SuperAdminCreateUpgradeRequestInput,
  SuperAdminCreateTicketInput,
  SuperAdminDashboardData,
  SuperAdminDefaulterReportData,
  SuperAdminExportJob,
  SuperAdminInviteAdminInput,
  SuperAdminNotificationPrefs,
  SuperAdminOperationsOverviewData,
  SuperAdminPlanData,
  SuperAdminProfileData,
  SuperAdminRecordStudentTransferInput,
  SuperAdminResultsComparisonData,
  SuperAdminStudentTransferOversightData,
  SuperAdminBranchFeeLedgerData,
  SuperAdminTicketActionInput,
  TenantInstitutionSettings,
  UpdateFeeBranchOverrideInput,
  UpdateSuperAdminProfileInput,
  UpdateTenantInstitutionSettingsInput,
} from "@eduos/types";
import { backendNotImplemented } from "./data-source";
import { djangoGet, djangoSend, DjangoApiError } from "./django-client";

// ── Backend response helpers ─────────────────────────────────────────────────

type Paginated<T> = { results?: T[] };

function unwrapList<T>(data: T[] | Paginated<T> | null | undefined): T[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && Array.isArray(data.results)) return data.results;
  return [];
}

const FEE_SCOPE_KINDS = new Set<FeeTemplateScope>(["tuition", "hostel", "transport", "exam", "other"]);

function mapFeeStructure(raw: Record<string, unknown>): FeeStructureTemplate {
  const components =
    (raw.components as Array<{ kind?: string; label?: string; amount_paise?: number }>) ?? [];
  const firstKind = components[0]?.kind ?? "other";
  const scope: FeeTemplateScope = FEE_SCOPE_KINDS.has(firstKind as FeeTemplateScope)
    ? (firstKind as FeeTemplateScope)
    : "other";

  return {
    id: String(raw.id),
    name: String(raw.name ?? ""),
    scope,
    currency: "INR",
    academicYearLabel: String(raw.academicYear ?? "—"),
    isActive: true,
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
    updatedAt: String(raw.updatedAt ?? new Date().toISOString()),
    items: components.map((c, i) => ({
      id: `item-${i}`,
      label: c.label ?? "Fee",
      amount: Math.round((c.amount_paise ?? 0) / 100),
      mandatory: true,
    })),
  };
}

function academicYearStatus(
  startDate: string,
  endDate: string,
  now: Date,
): SuperAdminAcademicYearStatus {
  const startMs = new Date(startDate).getTime();
  const endMs = new Date(endDate).getTime();
  const nowMs = now.getTime();
  if (nowMs < startMs) return "upcoming";
  if (nowMs > endMs) return "ended";
  return "in_progress";
}

function mapAcademicYearRow(
  branch: { id: string; name: string },
  year: { name: string; startDate: string; endDate: string },
  now: Date,
): SuperAdminAcademicYearOverviewRow {
  const status = academicYearStatus(year.startDate, year.endDate, now);
  const startMs = new Date(year.startDate).getTime();
  const endMs = new Date(year.endDate).getTime();
  const total = Math.max(1, endMs - startMs);
  const elapsed = Math.min(Math.max(now.getTime() - startMs, 0), total);
  const percentElapsed = Math.round((elapsed / total) * 100);
  const daysRemaining =
    status === "in_progress" ? Math.max(0, Math.ceil((endMs - now.getTime()) / 86400000)) : null;

  return {
    branchId: branch.id,
    branchName: branch.name,
    academicYearLabel: year.name,
    startDate: year.startDate,
    endDate: year.endDate,
    status,
    daysRemaining,
    percentElapsed,
  };
}

async function fetchBranches(request: Request): Promise<SuperAdminBranch[]> {
  const data = await djangoGet<SuperAdminBranchesData>(request, "/api/v1/organizations/branches/");
  return data.branches ?? [];
}

async function emptyBranchLedger(
  request: Request,
  branchId: string,
): Promise<SuperAdminBranchFeeLedgerData> {
  const branches = await fetchBranches(request);
  const branch = branches.find((b) => b.id === branchId);
  return {
    branchId,
    branchName: branch?.name ?? branchId,
    rows: [],
    totalOpenDue: 0,
    generatedAt: new Date().toISOString(),
  };
}

// ── Dashboard (existing mapper) ────────────────────────────────────────────

interface DjangoSuperAdminDashboard {
  totals: {
    branches: number;
    students: number;
    faculty: number;
    collectedPaise: number;
    invoicedPaise: number;
    pendingPaise: number;
    lowAttendanceCount: number;
  };
  branchComparison: Array<{
    branchId: string;
    branchName: string;
    collectedPaise: number;
    pendingPaise: number;
    lowAttendanceCount: number;
    studentCount: number;
    facultyCount: number;
    attendancePercent: number;
    facultyAttendancePercent: number;
  }>;
  lastUpdated?: string;
}

function paiseToRupees(paise: number): number {
  return Math.round(paise / 100);
}

function mapDjangoDashboard(payload: DjangoSuperAdminDashboard): SuperAdminDashboardData {
  const { totals, branchComparison } = payload;
  const branchKpis = branchComparison.map((b) => ({
    branchId: b.branchId,
    branchName: b.branchName,
    students: b.studentCount,
    faculty: b.facultyCount,
    attendancePercent: b.attendancePercent,
    facultyAttendancePercent: b.facultyAttendancePercent ?? 0,
    feeCollected: paiseToRupees(b.collectedPaise),
    feeDue: paiseToRupees(b.pendingPaise),
  }));

  const alerts: SuperAdminAlert[] = [];
  for (const b of branchComparison) {
    if (b.lowAttendanceCount > 0) {
      alerts.push({
        id: `att-${b.branchId}`,
        severity: "critical",
        type: "attendance",
        branchId: b.branchId,
        title: "Low attendance",
        message: `${b.branchName}: ${b.lowAttendanceCount} student(s) below the attendance threshold.`,
        createdAt: payload.lastUpdated ?? new Date().toISOString(),
      });
    }
    if (b.pendingPaise > 0) {
      alerts.push({
        id: `fee-${b.branchId}`,
        severity: "warning",
        type: "fees",
        branchId: b.branchId,
        title: "Outstanding fees",
        message: `${b.branchName}: ₹${paiseToRupees(b.pendingPaise).toLocaleString("en-IN")} pending collection.`,
        createdAt: payload.lastUpdated ?? new Date().toISOString(),
      });
    }
  }

  const totalStudentsInBranches = branchKpis.reduce((sum, k) => sum + k.students, 0);
  const overallAttendancePercent =
    totalStudentsInBranches > 0
      ? Math.round(
          branchKpis.reduce((sum, k) => sum + k.attendancePercent * k.students, 0) /
            totalStudentsInBranches,
        )
      : branchKpis.length > 0
        ? Math.round(
            branchKpis.reduce((sum, k) => sum + k.attendancePercent, 0) / branchKpis.length,
          )
        : 0;

  return {
    branchesCount: totals.branches,
    totalStudents: totals.students,
    totalFaculty: totals.faculty,
    overallAttendancePercent,
    totalFeeCollected: paiseToRupees(totals.collectedPaise),
    totalFeeDue: paiseToRupees(totals.pendingPaise),
    branchKpis,
    alerts,
  };
}

export async function getDashboard(
  request: Request,
  subdomain: string,
): Promise<SuperAdminDashboardData> {
  return mapDjangoDashboard(await djangoGet(request, "/api/v1/analytics/dashboard/super-admin/"));
}

// ── Branches ─────────────────────────────────────────────────────────────────

export async function listBranches(request: Request, subdomain: string): Promise<SuperAdminBranchesData> {
  return djangoGet(request, "/api/v1/organizations/branches/");
}

export async function createBranch(
  request: Request,
  subdomain: string,
  input: SuperAdminCreateBranchInput,
): Promise<{ branch: SuperAdminBranch }> {
  return djangoSend(request, "/api/v1/organizations/branches/", "POST", input);
}

export async function setBranchActive(
  request: Request,
  subdomain: string,
  input: { branchId: string; isActive: boolean },
): Promise<{ branch: SuperAdminBranch }> {
  return djangoSend(request, "/api/v1/organizations/branches/actions/", "PATCH", {
    action: "set_active",
    ...input,
  });
}

export async function updateBranchSettings(
  request: Request,
  subdomain: string,
  branchId: string,
  body: Record<string, unknown>,
): Promise<{ branch: SuperAdminBranch }> {
  return djangoSend(request, `/api/v1/organizations/branches/${branchId}/settings/`, "PATCH", body);
}

// ── Plan ─────────────────────────────────────────────────────────────────────

export async function getPlan(request: Request, subdomain: string): Promise<SuperAdminPlanData> {
  return djangoGet(request, "/api/v1/organizations/plan/");
}

export async function createUpgradeRequest(
  request: Request,
  subdomain: string,
  input: SuperAdminCreateUpgradeRequestInput,
) {
  return backendNotImplemented("plan upgrade request");
}

// ── Institution settings & branding ─────────────────────────────────────────

export async function getInstitutionSettings(
  request: Request,
  subdomain: string,
): Promise<TenantInstitutionSettings> {
  return djangoGet(request, "/api/v1/organizations/institution-settings/");
}

export async function updateInstitutionSettings(
  request: Request,
  subdomain: string,
  input: UpdateTenantInstitutionSettingsInput,
): Promise<TenantInstitutionSettings> {
  return djangoSend(request, "/api/v1/organizations/institution-settings/", "PATCH", input);
}

export async function goLiveInstitution(
  request: Request,
  subdomain: string,
  action: "go_live" | "undo_go_live",
): Promise<TenantInstitutionSettings> {
  return djangoSend(request, "/api/v1/organizations/institution-settings/", "POST", { action });
}

// ── Profile & password ───────────────────────────────────────────────────────

export async function getProfile(
  request: Request,
  subdomain: string,
  user: AuthUser,
): Promise<SuperAdminProfileData> {
  const me = await djangoGet<{ id: string; full_name?: string; name?: string; phone?: string | null }>(
    request,
    "/api/v1/auth/me/",
  );
  return {
    userId: me.id,
    name: me.full_name ?? me.name ?? user.name,
    phone: me.phone ?? user.phone,
    ownPhone: null,
  };
}

export async function updateProfile(
  request: Request,
  subdomain: string,
  user: AuthUser,
  input: UpdateSuperAdminProfileInput,
): Promise<SuperAdminProfileData> {
  return backendNotImplemented("profile update");
}

export async function changePassword(
  request: Request,
  userId: string,
  input: ChangeSuperAdminPasswordInput,
): Promise<void> {
  await djangoSend(request, "/api/v1/auth/password/change/", "POST", {
    currentPassword: input.currentPassword,
    newPassword: input.newPassword,
    confirmPassword: input.newPassword,
  });
}

// ── Academic years ───────────────────────────────────────────────────────────

export async function getAcademicYearOverview(
  request: Request,
  subdomain: string,
): Promise<SuperAdminAcademicYearOverviewData> {
  const branches = (await fetchBranches(request)).filter((b) => b.isActive);
  const now = new Date();

  const emptyRow = (branch: { id: string; name: string }): SuperAdminAcademicYearOverviewRow => ({
    branchId: branch.id,
    branchName: branch.name,
    academicYearLabel: "—",
    startDate: "",
    endDate: "",
    status: "upcoming",
    daysRemaining: null,
    percentElapsed: 0,
  });

  // One parallel fetch per branch instead of a sequential N-round-trip loop.
  const rows: SuperAdminAcademicYearOverviewRow[] = await Promise.all(
    branches.map(async (branch) => {
      try {
        const data = await djangoGet<{ academicYears: Array<{ name: string; startDate: string; endDate: string; isCurrent: boolean }> }>(
          request,
          `/api/v1/academics/academic-years/?branch=${encodeURIComponent(branch.id)}`,
        );
        const years = data.academicYears ?? [];
        const current = years.find((y) => y.isCurrent) ?? years[0];
        return current ? mapAcademicYearRow(branch, current, now) : emptyRow(branch);
      } catch {
        return emptyRow(branch);
      }
    }),
  );

  return { rows, generatedAt: now.toISOString() };
}

// ── Defaulters ───────────────────────────────────────────────────────────────

export async function getDefaulterReport(
  request: Request,
  subdomain: string,
): Promise<SuperAdminDefaulterReportData> {
  type DefaulterInvoice = {
    id: string;
    student: { id: string; fullName: string };
    totalPaise: number;
    paidPaise: number;
  };
  const branches = (await fetchBranches(request)).filter((b) => b.isActive);
  const rowsMap = new Map<string, SuperAdminDefaulterReportData["rows"][number]>();
  const byBranch = new Map<string, { branchId: string; branchName: string; dueAmount: number }>();
  let totalDue = 0;

  // Fetch every branch's defaulters in parallel — this used to be a sequential
  // per-branch Django round-trip (N branches ⇒ N×latency, ~12s for a real tenant).
  const perBranch = await Promise.all(
    branches.map(async (branch) => {
      try {
        const invoices = await djangoGet<DefaulterInvoice[] | Paginated<DefaulterInvoice>>(
          request,
          `/api/v1/fees/defaulters/?branchId=${encodeURIComponent(branch.id)}`,
        );
        return { branch, invoices: unwrapList(invoices) };
      } catch {
        // Branch may have no defaulters or missing fee context.
        return { branch, invoices: [] as DefaulterInvoice[] };
      }
    }),
  );

  // Aggregate in a stable branch order (in-memory, cheap).
  for (const { branch, invoices } of perBranch) {
    for (const inv of invoices) {
      const balance = Math.max(0, (inv.totalPaise - inv.paidPaise) / 100);
      if (balance <= 0) continue;
      totalDue += balance;
      const prev = byBranch.get(branch.id);
      if (prev) prev.dueAmount += balance;
      else byBranch.set(branch.id, { branchId: branch.id, branchName: branch.name, dueAmount: balance });

      const sid = inv.student.id;
      const existing = rowsMap.get(sid);
      const branchRow = { branchId: branch.id, branchName: branch.name, dueAmount: balance };
      if (existing) {
        existing.totalDue += balance;
        // Merge multiple invoices in the same branch into one entry so each student's
        // branch list has unique branchIds (also fixes a duplicate React key warning).
        const existingBranch = existing.branches.find((x) => x.branchId === branch.id);
        if (existingBranch) existingBranch.dueAmount += balance;
        else existing.branches.push(branchRow);
      } else {
        rowsMap.set(sid, {
          studentId: sid,
          studentName: inv.student.fullName,
          guardianName: null,
          totalDue: balance,
          branches: [branchRow],
          lastPaymentAt: null,
        });
      }
    }
  }

  const rows = Array.from(rowsMap.values()).sort((a, b) => b.totalDue - a.totalDue);
  const branchesTotalDue = Array.from(byBranch.values()).sort((a, b) => b.dueAmount - a.dueAmount);
  return { rows, totalDue, branchesTotalDue, generatedAt: new Date().toISOString() };
}

// ── Alerts ───────────────────────────────────────────────────────────────────

export async function listAlerts(request: Request, subdomain: string): Promise<{ alerts: SuperAdminAlert[] }> {
  const dashboard = await getDashboard(request, subdomain);
  return { alerts: dashboard.alerts };
}

// ── Notifications ──────────────────────────────────────────────────────────

const DEFAULT_PREFS: SuperAdminNotificationPrefs = {
  email: true,
  sms: false,
  inApp: true,
  digest: "weekly",
};

export async function getNotificationPrefs(
  request: Request,
  subdomain: string,
  userId: string,
): Promise<SuperAdminNotificationPrefs> {
  return Promise.resolve(DEFAULT_PREFS);
}

export async function updateNotificationPrefs(
  request: Request,
  subdomain: string,
  userId: string,
  input: Partial<SuperAdminNotificationPrefs>,
): Promise<SuperAdminNotificationPrefs> {
  return backendNotImplemented("notification preferences");
}

// ── Fee templates (structures) ─────────────────────────────────────────────

export async function listFeeTemplates(request: Request, subdomain: string) {
  const branches = (await fetchBranches(request)).filter((b) => b.isActive);

  // Parallel per-branch fetch instead of a sequential N-round-trip loop.
  const perBranch = await Promise.all(
    branches.map(async (branch) => {
      try {
        const raw = await djangoGet<Record<string, unknown>[] | Paginated<Record<string, unknown>>>(
          request,
          `/api/v1/fees/structures/?branchId=${encodeURIComponent(branch.id)}&page_size=100`,
        );
        return unwrapList(raw).map(mapFeeStructure);
      } catch {
        // Skip branches with no fee structures or missing branch context.
        return [] as FeeStructureTemplate[];
      }
    }),
  );

  return { templates: perBranch.flat() };
}

export async function createFeeTemplate(
  request: Request,
  subdomain: string,
  input: CreateFeeStructureTemplateInput,
): Promise<{ template: FeeStructureTemplate }> {
  return djangoSend(request, "/api/v1/fees/structures/", "POST", input);
}

export async function setFeeTemplateActive(
  request: Request,
  subdomain: string,
  input: { templateId: string; isActive: boolean },
): Promise<{ template: FeeStructureTemplate }> {
  return djangoSend(request, `/api/v1/fees/structures/${input.templateId}/`, "PATCH", { isActive: input.isActive });
}

// ── Fee overrides ────────────────────────────────────────────────────────────

export async function listFeeOverrides(request: Request, subdomain: string): Promise<FeeBranchOverridesData> {
  const branches = await fetchBranches(request);
  return {
    branches: branches.map((b) => ({ id: b.id, name: b.name })),
    templates: [],
    overrides: [],
  };
}

export async function upsertFeeOverride(
  request: Request,
  subdomain: string,
  input: UpdateFeeBranchOverrideInput,
) {
  const components = input.items.map((it, idx) => ({
    kind: "tuition",
    label: it.label.trim() || `Item ${idx + 1}`,
    amount_paise: Math.round((Number(it.amount) || 0) * 100),
    due_date: "2025-07-31",
    installment_no: idx + 1,
  }));
  await djangoSend(
    request,
    `/api/v1/fees/structures/${input.templateId}/?branchId=${encodeURIComponent(input.branchId)}`,
    "PATCH",
    { components },
  );
  const override = {
    branchId: input.branchId,
    templateId: input.templateId,
    items: input.items.map((it, idx) => ({
      id: it.id ?? `ov-${input.branchId}-${idx + 1}`,
      label: it.label,
      amount: Number(it.amount) || 0,
      mandatory: Boolean(it.mandatory),
    })),
    updatedAt: new Date().toISOString(),
  };
  return { override };
}

// ── Exports ──────────────────────────────────────────────────────────────────

interface DjangoReportExport {
  id: string;
  reportType: string;
  status: string;
  rowCount: number;
  createdAt: string;
  updatedAt?: string;
  error?: string;
  downloadUrl?: string;
}

function mapExportStatus(status: string): SuperAdminExportJob["status"] {
  if (status === "ready") return "completed";
  if (status === "queued" || status === "running" || status === "failed") return status;
  return "failed";
}

function toSuperAdminExportJob(row: DjangoReportExport): SuperAdminExportJob {
  const status = mapExportStatus(row.status);
  const completed = status === "completed";
  return {
    id: row.id,
    type: "branch_summary",
    status,
    progressPercent: completed ? 100 : status === "running" ? 50 : 0,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt ?? row.createdAt,
    completedAt: completed ? row.updatedAt ?? row.createdAt : null,
    error: row.error || null,
    downloadUrl: completed ? `/api/super-admin/exports/${row.id}/download` : null,
  };
}

export async function listExportJobs(
  request: Request,
  _subdomain: string,
): Promise<{ jobs: SuperAdminExportJob[]; generatedAt: string }> {
  const data = await djangoGet<{ reports: DjangoReportExport[] }>(
    request,
    "/api/v1/analytics/reports/?reportType=branch_summary&limit=50",
  );
  return {
    jobs: (data.reports ?? [])
      .filter((row) => row.reportType === "branch_summary")
      .map(toSuperAdminExportJob),
    generatedAt: new Date().toISOString(),
  };
}

export async function createExportJob(
  request: Request,
  _subdomain: string,
  input: { type: SuperAdminExportJob["type"] },
): Promise<{ job: SuperAdminExportJob }> {
  const data = await djangoSend<{ report: DjangoReportExport }>(
    request,
    "/api/v1/analytics/reports/",
    "POST",
    { reportType: input.type, params: {} },
  );
  return { job: toSuperAdminExportJob(data.report) };
}

// ── Features without backend yet ─────────────────────────────────────────────

export async function listTickets(request: Request, subdomain: string) {
  return Promise.resolve({ tickets: [] });
}

export async function createTicket(
  request: Request,
  subdomain: string,
  input: SuperAdminCreateTicketInput,
) {
  return backendNotImplemented("support tickets");
}

export async function applyTicketAction(
  request: Request,
  subdomain: string,
  input: SuperAdminTicketActionInput,
) {
  return backendNotImplemented("support tickets");
}

export async function getResultsComparison(
  request: Request,
  subdomain: string,
  filters?: { branchId?: string | null; examId?: string | null },
): Promise<SuperAdminResultsComparisonData> {
  const query = new URL(request.url).searchParams;
  const branchId = filters?.branchId ?? query.get("branchId");
  const examId = filters?.examId ?? query.get("examId");
  const filterArgs = {
    branchId: branchId || null,
    examId: examId || null,
  };

  const params = new URLSearchParams();
  if (filterArgs.branchId) params.set("branchId", filterArgs.branchId);
  if (filterArgs.examId) params.set("examId", filterArgs.examId);
  const qs = params.toString();
  const payload = await djangoGet<{
    branches: SuperAdminResultsComparisonData["branches"];
    scoreBands: SuperAdminResultsComparisonData["scoreBands"];
    filterOptions: SuperAdminResultsComparisonData["filterOptions"];
    selectedBranchId: string | null;
    selectedExamId: string | null;
    generatedAt: string;
  }>(
    request,
    `/api/v1/analytics/super-admin/results-comparison/${qs ? `?${qs}` : ""}`,
  );
  return {
    branches: payload.branches ?? [],
    scoreBands: payload.scoreBands ?? [],
    filterOptions: payload.filterOptions ?? { branches: [], exams: [] },
    selectedBranchId: payload.selectedBranchId ?? null,
    selectedExamId: payload.selectedExamId ?? null,
    generatedAt: payload.generatedAt ?? new Date().toISOString(),
  };
}

export async function listAnnouncements(request: Request, subdomain: string) {
  const branches = await fetchBranches(request);
  return {
    branches: branches.map((b) => ({ id: b.id, name: b.name })),
    announcements: [],
  };
}

export async function createAnnouncement(
  request: Request,
  subdomain: string,
  authorName: string,
  input: CreateSuperAdminAnnouncementInput,
) {
  return backendNotImplemented("announcements");
}

export async function getOperationsOverview(
  request: Request,
  subdomain: string,
): Promise<SuperAdminOperationsOverviewData> {
  return djangoGet(request, "/api/v1/auth/super-admin/operations/overview/");
}

export async function listAdmins(request: Request, subdomain: string): Promise<{ admins: SuperAdminBranchAdminUser[] }> {
  return djangoGet(request, "/api/v1/auth/admins/");
}

export async function inviteAdmin(
  request: Request,
  subdomain: string,
  input: SuperAdminInviteAdminInput,
): Promise<{ admin: SuperAdminBranchAdminUser }> {
  return djangoSend(request, "/api/v1/auth/admins/", "POST", input);
}

export async function setAdminActive(
  request: Request,
  subdomain: string,
  input: { adminId: string; isActive: boolean },
): Promise<{ admin: SuperAdminBranchAdminUser }> {
  return djangoSend(request, `/api/v1/auth/admins/${input.adminId}/`, "PATCH", {
    isActive: input.isActive,
  });
}

export async function setAdminBranch(
  request: Request,
  subdomain: string,
  input: { adminId: string; branchId: string },
): Promise<{ admin: SuperAdminBranchAdminUser }> {
  return djangoSend(request, `/api/v1/auth/admins/${input.adminId}/`, "PATCH", {
    branchId: input.branchId,
  });
}

export async function getStudentTransferOversight(
  request: Request,
  subdomain: string,
): Promise<SuperAdminStudentTransferOversightData> {
  return Promise.resolve({
    rows: [],
    feePolicyLabel: "Prior-branch dues remain on the source branch ledger.",
    generatedAt: new Date().toISOString(),
  });
}

export async function getBranchFeeLedger(
  request: Request,
  subdomain: string,
  branchId: string,
): Promise<SuperAdminBranchFeeLedgerData> {
  return emptyBranchLedger(request, branchId);
}

export async function recordStudentTransfer(
  request: Request,
  subdomain: string,
  input: SuperAdminRecordStudentTransferInput,
) {
  return backendNotImplemented("student transfer");
}

export { AuthError, DjangoApiError };
