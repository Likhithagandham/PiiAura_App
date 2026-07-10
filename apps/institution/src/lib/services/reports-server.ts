/**
 * Admin module reports — Django analytics export API.
 */

import { ADMIN_ROUTES, LARGE_EXPORT_ROW_THRESHOLD } from "@eduos/constants";
import type { ExportJob, ReportDefinition } from "@eduos/types";
import { djangoGet, djangoSend } from "./django-client";

const REPORT_TYPE_LABELS: Record<string, string> = {
  admission_funnel: "Admissions funnel",
  fee_defaulters: "Fee defaulters",
  attendance_monthly: "Attendance monthly",
  hr_leave_summary: "HR leave summary",
  fee_collection: "Fee collection summary",
  fee_ledger: "Fee ledger",
  attendance_shortage: "Attendance shortage",
  attendance_ranking: "Attendance ranking",
};

/** Static catalog aligned with backend ReportType enum. */
export const REPORT_CATALOG: ReportDefinition[] = [
  {
    id: "admission_funnel",
    module: "admissions",
    name: "Admissions funnel",
    description: "Enquiries through enrollment by stage",
    rowCount: 0,
  },
  {
    id: "fee_defaulters",
    module: "fees",
    name: "Fee defaulters",
    description: "Students with overdue balances",
    rowCount: 0,
  },
  {
    id: "attendance_monthly",
    module: "attendance",
    name: "Attendance monthly",
    description: "Per-student attendance for a calendar month",
    rowCount: 0,
    requiresParams: true,
  },
  {
    id: "hr_leave_summary",
    module: "hr",
    name: "HR leave summary",
    description: "Leave balances and usage by employee",
    rowCount: 0,
  },
  {
    id: "fee_collection",
    module: "fees",
    name: "Fee collection summary",
    description: "Collections and dues by batch",
    rowCount: 0,
    comingSoon: true,
  },
  {
    id: "fee_ledger",
    module: "fees",
    name: "Fee ledger",
    description: "All fee invoices with amount, paid, and balance",
    rowCount: 0,
  },
  {
    id: "attendance_shortage",
    module: "attendance",
    name: "Attendance shortage",
    description: "Students below the attendance threshold",
    rowCount: 0,
  },
  {
    id: "attendance_ranking",
    module: "attendance",
    name: "Attendance ranking",
    description: "All students ranked by attendance % this month",
    rowCount: 0,
  },
  {
    id: "exam_results",
    module: "examinations",
    name: "Exam results",
    description: "Export marks per exam from the Examinations module",
    rowCount: 0,
    linkHref: ADMIN_ROUTES.examinations,
  },
];

interface DjangoReportExport {
  id: string;
  reportType: string;
  status: string;
  rowCount: number;
  snapshot?: { rows?: unknown[]; capturedAt?: string };
  downloadUrl?: string;
  expiresAt?: string | null;
  createdAt: string;
  error?: string;
}

function mapStatus(status: string): ExportJob["status"] {
  if (status === "running") return "processing";
  if (status === "queued" || status === "ready" || status === "failed") {
    return status as ExportJob["status"];
  }
  return "failed";
}

function toExportJob(row: DjangoReportExport): ExportJob {
  const isBackground = row.rowCount > LARGE_EXPORT_ROW_THRESHOLD;
  const ready = row.status === "ready";
  return {
    id: row.id,
    reportId: row.reportType,
    reportName: REPORT_TYPE_LABELS[row.reportType] ?? row.reportType,
    status: mapStatus(row.status),
    rowCount: row.rowCount,
    isBackground,
    snapshot: {
      capturedAt: row.createdAt,
      rowCount: row.rowCount,
      note: "Snapshot frozen at request time.",
    },
    downloadUrl: ready ? `/api/admin/reports/download?id=${row.id}` : undefined,
    downloadExpiresAt: row.expiresAt ?? undefined,
    createdAt: row.createdAt,
    completedAt: ready ? row.createdAt : undefined,
    error: row.error,
  };
}

export function listReportCatalog(): ReportDefinition[] {
  return structuredClone(REPORT_CATALOG);
}

export async function listExportJobs(request: Request): Promise<ExportJob[]> {
  const data = await djangoGet<{ reports: DjangoReportExport[] }>(
    request,
    "/api/v1/analytics/reports/",
  );
  return (data.reports ?? []).map(toExportJob);
}

export async function requestExport(
  request: Request,
  reportId: string,
  params?: Record<string, unknown>,
): Promise<ExportJob> {
  const data = await djangoSend<{ report: DjangoReportExport }>(
    request,
    "/api/v1/analytics/reports/",
    "POST",
    { reportType: reportId, params: params ?? {} },
  );
  return toExportJob(data.report);
}

export async function getExportForDownload(request: Request, exportId: string) {
  return djangoGet<DjangoReportExport>(request, `/api/v1/analytics/reports/${exportId}/`);
}
