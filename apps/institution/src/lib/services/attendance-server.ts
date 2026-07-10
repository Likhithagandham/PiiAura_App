/**
 * Attendance portal — Django backend boundary.
 *
 * Reads use a single backend aggregate endpoint that returns the exact
 * `AttendanceData` / `LiveAttendanceSnapshot` shapes (names resolved server-side):
 *   GET /api/v1/attendance/admin-overview/        → AttendanceData
 *   GET /api/v1/attendance/admin-overview/live/   → LiveAttendanceSnapshot
 * Writes (correct/leave/rules) call the existing per-action endpoints.
 */

import type {
  AdminBulkMarkInput,
  AdminMarkAttendanceContext,
  AdminMarkAttendanceQuery,
  AttendanceData,
  AttendanceReportQuery,
  CorrectAttendanceInput,
  CreateLeaveInput,
  LiveAttendanceSnapshot,
  ReviewLeaveInput,
} from "@eduos/types";
import { djangoGet, djangoSend } from "./django-client";

// ─── Reads ──────────────────────────────────────────────────────────────────

export async function getAttendanceData(
  request: Request,
  subdomain: string,
  query?: AttendanceReportQuery,
): Promise<AttendanceData> {
  const qs = buildReportQuery(query);
  return djangoGet<AttendanceData>(request, `/api/v1/attendance/admin-overview/${qs}`);
}

function buildReportQuery(query?: AttendanceReportQuery): string {
  if (!query) return "";
  const params = new URLSearchParams();
  if (query.period) params.set("period", query.period);
  if (query.week) params.set("week", query.week);
  if (query.month) params.set("month", query.month);
  if (query.batchId) params.set("batchId", query.batchId);
  const s = params.toString();
  return s ? `?${s}` : "";
}

export async function getLiveAttendance(
  request: Request,
  subdomain: string,
): Promise<LiveAttendanceSnapshot> {
  return djangoGet<LiveAttendanceSnapshot>(
    request,
    "/api/v1/attendance/admin-overview/live/",
  );
}

function buildMarkQuery(query?: AdminMarkAttendanceQuery): string {
  if (!query) return "";
  const params = new URLSearchParams();
  if (query.date) params.set("date", query.date);
  if (query.batchId) params.set("batchId", query.batchId);
  if (query.batchSubjectId) params.set("batchSubjectId", query.batchSubjectId);
  if (query.periodSlotId) params.set("periodSlotId", query.periodSlotId);
  const s = params.toString();
  return s ? `?${s}` : "";
}

export async function getAdminMarkContext(
  request: Request,
  subdomain: string,
  query?: AdminMarkAttendanceQuery,
): Promise<AdminMarkAttendanceContext> {
  const qs = buildMarkQuery(query);
  return djangoGet<AdminMarkAttendanceContext>(
    request,
    `/api/v1/attendance/admin-overview/mark/${qs}`,
  );
}

// ─── Writes ─────────────────────────────────────────────────────────────────

export async function correctRecord(
  request: Request,
  subdomain: string,
  input: CorrectAttendanceInput,
  adminUserId: string,
) {
  return djangoSend(
    request,
    `/api/v1/attendance/records/${input.recordId}/correct/`,
    "PATCH",
    { newStatus: input.newStatus, reason: input.note },
  );
}

export async function reviewLeave(
  request: Request,
  subdomain: string,
  input: ReviewLeaveInput,
  reviewerUserId: string,
  reviewerName = "Reviewer",
) {
  return djangoSend(
    request,
    `/api/v1/attendance/leave/${input.requestId}/`,
    "PATCH",
    { action: input.approve ? "approve" : "reject", note: input.reviewNote ?? "" },
  );
}

export async function createLeave(
  request: Request,
  subdomain: string,
  input: CreateLeaveInput,
) {
  return djangoSend(request, "/api/v1/attendance/leave/", "POST", {
    studentId: input.studentId,
    fromDate: input.fromDate,
    toDate: input.toDate,
    reason: input.reason,
  });
}

export async function bulkMarkAttendance(
  request: Request,
  subdomain: string,
  records: AdminBulkMarkInput[],
  markedByUserId: string,
) {
  return djangoSend(request, "/api/v1/attendance/faculty/records/bulk-mark/", "PATCH", {
    records,
  });
}

export async function updateRules(
  request: Request,
  subdomain: string,
  body: Record<string, unknown>,
) {
  // Map frontend field names to the Django settings serializer's names.
  const djangoBody: Record<string, unknown> = {};
  if ("thresholdPercent" in body) {
    djangoBody.attendanceThresholdPercent = body.thresholdPercent;
  }
  if ("examDayCountsTowardThreshold" in body) {
    djangoBody.examDayCountsTowardAttendance = body.examDayCountsTowardThreshold;
  }
  return djangoSend(
    request,
    "/api/v1/organizations/attendance-settings/",
    "PATCH",
    djangoBody,
  );
}

// ─── CSV exports (not yet implemented on backend) ────────────────────────────

export function exportPeriodCsv(subdomain: string, query?: AttendanceReportQuery): string {
  return "";
}

export function exportDetentionCsv(subdomain: string, query?: AttendanceReportQuery): string {
  return "";
}

/** @deprecated Use exportPeriodCsv */
export function exportMonthlyCsv(subdomain: string, query?: AttendanceReportQuery): string {
  return exportPeriodCsv(subdomain, query);
}
