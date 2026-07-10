import * as attendanceServer from "@/lib/services/attendance-server";
import type {
  AdminBulkMarkInput,
  AttendanceReportQuery,
  CorrectAttendanceInput,
  CreateLeaveInput,
  ReviewLeaveInput,
} from "@eduos/types";
import { NextResponse } from "next/server";
import { auditDiffLine, logSensitiveMutation } from "@/lib/admin/audit-log";
import { requireAdmin } from "@/lib/admin/api";
import { withIdempotency } from "@/lib/admin/idempotency";

export async function PATCH(request: Request) {
  return withIdempotency(request, async () => {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    const body = (await request.json()) as { action: string; [key: string]: unknown };

    try {
      const { subdomain, user } = auth;
      switch (body.action) {
        case "correct_record": {
          const payload = body.payload as CorrectAttendanceInput;
          const result = await attendanceServer.correctRecord(
            request,
            subdomain,
            payload,
            user.id,
          );
          logSensitiveMutation(request, subdomain, user, {
            action: "attendance.record.correct",
            entityType: "attendance_record",
            entityId: payload.recordId,
            diff: [
              auditDiffLine("status", null, payload.newStatus),
              auditDiffLine("note", null, payload.note),
            ],
          });
          return NextResponse.json(result);
        }
        case "review_leave": {
          const payload = body.payload as ReviewLeaveInput;
          const result = await attendanceServer.reviewLeave(
            request,
            subdomain,
            payload,
            user.id,
            user.name,
          );
          logSensitiveMutation(request, subdomain, user, {
            action: "attendance.leave.review",
            entityType: "leave_request",
            entityId: payload.requestId,
            diff: [auditDiffLine("approved", null, payload.approve)],
          });
          return NextResponse.json(result);
        }
        case "create_leave": {
          const payload = body.payload as CreateLeaveInput;
          const result = await attendanceServer.createLeave(request, subdomain, payload);
          logSensitiveMutation(request, subdomain, user, {
            action: "attendance.leave.create",
            entityType: "leave_request",
            entityId: (result as { id?: string })?.id ?? "unknown",
            diff: [auditDiffLine("studentId", null, payload.studentId)],
          });
          return NextResponse.json(result);
        }
        case "bulk_mark": {
          const records = body.records as AdminBulkMarkInput[];
          const result = await attendanceServer.bulkMarkAttendance(
            request,
            subdomain,
            records,
            user.id,
          );
          logSensitiveMutation(request, subdomain, user, {
            action: "attendance.session.mark",
            entityType: "attendance_session",
            entityId: (body.sessionId as string) ?? "bulk",
            diff: [auditDiffLine("recordCount", null, records.length)],
          });
          return NextResponse.json(result);
        }
        case "set_exam_day_rule": {
          const enabled = Boolean(body.examDayCountsTowardThreshold);
          const result = await attendanceServer.updateRules(request, subdomain, {
            examDayCountsTowardThreshold: enabled,
          });
          logSensitiveMutation(request, subdomain, user, {
            action: "attendance.rules.exam_day",
            entityType: "settings",
            entityId: subdomain,
            diff: [auditDiffLine("examDayCountsTowardThreshold", null, enabled)],
          });
          return NextResponse.json(result);
        }
        case "set_threshold": {
          const threshold = Number(body.thresholdPercent);
          const result = await attendanceServer.updateRules(request, subdomain, {
            thresholdPercent: threshold,
          });
          logSensitiveMutation(request, subdomain, user, {
            action: "attendance.rules.threshold",
            entityType: "settings",
            entityId: subdomain,
            diff: [auditDiffLine("thresholdPercent", null, threshold)],
          });
          return NextResponse.json(result);
        }
        case "export_monthly": {
          const reportQuery = body.reportQuery as AttendanceReportQuery | undefined;
          logSensitiveMutation(request, subdomain, user, {
            action: "attendance.export.monthly",
            entityType: "export",
            entityId: "attendance-period-by-student",
            diff: [],
          });
          return new NextResponse(attendanceServer.exportPeriodCsv(subdomain, reportQuery), {
            headers: {
              "Content-Type": "text/csv",
              "Content-Disposition": 'attachment; filename="attendance-period-by-student.csv"',
            },
          });
        }
        case "export_detention": {
          const reportQuery = body.reportQuery as AttendanceReportQuery | undefined;
          logSensitiveMutation(request, subdomain, user, {
            action: "attendance.export.detention",
            entityType: "export",
            entityId: "detention-list",
            diff: [],
          });
          return new NextResponse(attendanceServer.exportDetentionCsv(subdomain, reportQuery), {
            headers: {
              "Content-Type": "text/csv",
              "Content-Disposition": 'attachment; filename="detention-list.csv"',
            },
          });
        }
        default:
          return NextResponse.json({ error: "Unknown action" }, { status: 400 });
      }
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Request failed" },
        { status: 400 },
      );
    }
  });
}
