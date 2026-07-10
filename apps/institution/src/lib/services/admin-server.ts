/**
 * Admin portal — Django backend service.
 */

import { ADMIN_ROUTES } from "@eduos/constants";
import type { AdminDashboardData, AdminAlert, AdminSettings, LiveAttendanceSnapshot } from "@eduos/types";
import { djangoGet, djangoSend } from "./django-client";
import { getInstitutionName } from "./tenant-server";

interface DjangoAdminDashboard {
  fees?: {
    totalCollectedPaise?: number;
    totalPendingPaise?: number;
    totalInvoicedPaise?: number;
  };
  alerts?: {
    lowAttendanceCount?: number;
    pendingFeesCount?: number;
    pendingHrLeaveCount?: number;
    openGrievancesCount?: number;
    attendanceThreshold?: number;
  };
  lastUpdated?: string;
}

const LIVE_ATTENDANCE_PATH = "/api/v1/attendance/admin-overview/live/";

function paiseToRupees(paise: number): number {
  return Math.round(paise / 100);
}

const QUICK_ACTIONS: AdminDashboardData["quickActions"] = [
  {
    id: "mark-holiday",
    label: "Mark holiday",
    description: "Declare a holiday for specific classes or the entire institution",
    action: "mark-holiday",
  },
  {
    id: "send-announcement",
    label: "Send notice",
    description: "Publish an in-app notice to parents, teachers, or students",
    action: "send-announcement",
  },
];

function mapDjangoAlerts(payload: DjangoAdminDashboard): AdminAlert[] {
  const alerts: AdminAlert[] = [];
  const a = payload.alerts ?? {};
  const threshold = a.attendanceThreshold ?? 75;

  if ((a.lowAttendanceCount ?? 0) > 0) {
    alerts.push({
      id: "low-attendance",
      title: "Low attendance",
      message: `${a.lowAttendanceCount} student(s) below ${threshold}% attendance threshold`,
      severity: "warning",
      href: ADMIN_ROUTES.attendance,
      count: a.lowAttendanceCount,
    });
  }

  if ((a.pendingFeesCount ?? 0) > 0) {
    alerts.push({
      id: "pending-fees",
      title: "Pending fees",
      message: `${a.pendingFeesCount} student(s) with outstanding fees`,
      severity: "critical",
      href: ADMIN_ROUTES.fees,
      count: a.pendingFeesCount,
    });
  }

  if ((a.pendingHrLeaveCount ?? 0) > 0) {
    alerts.push({
      id: "pending-hr-leave",
      title: "Pending HR leave",
      message: `${a.pendingHrLeaveCount} staff leave request(s) awaiting approval`,
      severity: "warning",
      href: ADMIN_ROUTES.hr,
      count: a.pendingHrLeaveCount,
    });
  }

  if ((a.openGrievancesCount ?? 0) > 0) {
    alerts.push({
      id: "open-grievances",
      title: "Open grievances",
      message: `${a.openGrievancesCount} grievance(s) need attention`,
      severity: "warning",
      href: ADMIN_ROUTES.grievances,
      count: a.openGrievancesCount,
    });
  }

  return alerts;
}

/** Merge live attendance totals into dashboard snapshot KPIs. */
function enrichSnapshotWithLive(
  dashboard: Omit<AdminDashboardData, "live">,
  live: LiveAttendanceSnapshot,
): AdminDashboardData {
  const classes = live.classes ?? [];
  const running = classes.filter((c) => c.total > 0).length;
  return {
    ...dashboard,
    live,
    snapshot: {
      ...dashboard.snapshot,
      studentsPresentPercent: live.percent,
      studentsPresentCount: live.present,
      studentsTotal: live.total,
      classesRunning: running,
      classesScheduled: classes.length,
    },
  };
}

async function fetchLiveSnapshot(request: Request): Promise<LiveAttendanceSnapshot> {
  return djangoGet<LiveAttendanceSnapshot>(request, LIVE_ATTENDANCE_PATH);
}

export async function getDashboard(request: Request, subdomain: string): Promise<AdminDashboardData> {
  const [raw, live] = await Promise.all([
    djangoGet<DjangoAdminDashboard>(request, "/api/v1/analytics/dashboard/admin/"),
    fetchLiveSnapshot(request).catch(() => ({
      present: 0,
      total: 0,
      percent: 0,
      classes: [],
      updatedAt: new Date().toISOString(),
    })),
  ]);
  const fees = raw.fees ?? {};
  const base: Omit<AdminDashboardData, "live"> = {
    snapshot: {
      studentsPresentPercent: 0,
      studentsPresentCount: 0,
      studentsTotal: 0,
      feeCollectedToday: paiseToRupees(fees.totalCollectedPaise ?? 0),
      feeCollectedCurrency: "INR",
      classesRunning: 0,
      classesScheduled: 0,
      asOf: raw.lastUpdated ?? new Date().toISOString(),
    },
    quickActions: QUICK_ACTIONS,
    alerts: mapDjangoAlerts(raw),
  };
  return enrichSnapshotWithLive(base, live);
}

export async function getLiveAttendance(
  request: Request,
  subdomain: string,
): Promise<LiveAttendanceSnapshot> {
  return fetchLiveSnapshot(request);
}

const EMPTY_ADDRESS = { line1: "", city: "", state: "", pincode: "" };

export async function getSettings(request: Request, subdomain: string): Promise<AdminSettings> {
  const [me, institutionName, dash] = await Promise.all([
    djangoGet<{ institution_type?: string; theme?: { logoUrl?: string | null } }>(
      request,
      "/api/v1/auth/me/",
    ),
    getInstitutionName(subdomain).catch(() => "Institution"),
    djangoGet<DjangoAdminDashboard>(request, "/api/v1/analytics/dashboard/admin/").catch(() => null),
  ]);

  const institutionType = me.institution_type === "college" ? "college" : "school";
  const threshold = dash?.alerts?.attendanceThreshold ?? 75;

  return {
    institution: {
      institutionName,
      logoUrl: me.theme?.logoUrl ?? null,
      institutionAddress: { ...EMPTY_ADDRESS },
      branchName: "",
      branchAddress: { ...EMPTY_ADDRESS },
    },
    integrations: {
      razorpayKeyId: "",
      razorpayKeySecretMasked: "",
      msg91AuthKeyMasked: "",
      msg91SenderId: "",
      configured: { razorpay: false, msg91: false },
    },
    academicYears: [],
    featureToggles: [],
    attendanceRules: {
      thresholdPercent: threshold,
      examDayCountsTowardThreshold: true,
    },
    institutionType,
  };
}

export async function getAuditLogs(request: Request, subdomain: string) {
  return djangoGet(request, "/api/v1/analytics/audit/");
}

export async function getCollectionDashboard(request: Request, subdomain: string) {
  return djangoGet(request, "/api/v1/fees/collection/");
}

export async function getDefaulters(request: Request, subdomain: string) {
  return djangoGet(request, "/api/v1/fees/defaulters/");
}

export async function updateAttendanceSettings(
  request: Request,
  subdomain: string,
  body: Record<string, unknown>,
) {
  return djangoSend(request, "/api/v1/organizations/attendance-settings/", "PATCH", body);
}
