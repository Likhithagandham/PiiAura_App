import { requireAdmin } from "@/lib/admin/api";
import { withIdempotency } from "@/lib/admin/idempotency";
import { auditDiffLine, logSensitiveMutation } from "@/lib/admin/audit-log";
import { requestExport } from "@/lib/services/reports-server";
import { DjangoApiError } from "@/lib/services/django-client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  return withIdempotency(request, async () => {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    const body = (await request.json()) as { reportId?: string; params?: Record<string, unknown> };
    if (!body.reportId) {
      return NextResponse.json({ error: "reportId is required" }, { status: 400 });
    }

    try {
      const job = await requestExport(request, body.reportId, body.params);
      logSensitiveMutation(request, auth.subdomain, auth.user, {
        action: "reports.export.request",
        entityType: "export_job",
        entityId: job.id,
        diff: [auditDiffLine("reportId", null, job.reportId)],
      });
      return NextResponse.json(job);
    } catch (err) {
      const message = err instanceof DjangoApiError ? err.message : err instanceof Error ? err.message : "Export failed";
      const status = err instanceof DjangoApiError ? err.status : 404;
      return NextResponse.json({ error: message }, { status });
    }
  });
}
