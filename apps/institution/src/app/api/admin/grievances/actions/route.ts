import { NextResponse } from "next/server";
import { auditDiffLine, logSensitiveMutation } from "@/lib/admin/audit-log";
import { requireAdmin } from "@/lib/admin/api";
import { withIdempotency } from "@/lib/admin/idempotency";
import { djangoSend } from "@/lib/services/django-client";

/** F-255 — assign / resolve / reopen grievances (audited). */
export async function PATCH(request: Request) {
  return withIdempotency(request, async () => {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    const body = (await request.json()) as {
      action: string;
      grievanceId?: string;
      assigneeId?: string;
      assigneeName?: string;
      resolutionNote?: string;
      status?: "resolved" | "closed";
    };
    const { subdomain, user } = auth;
    const grievanceId = String(body.grievanceId ?? "");

    try {
      const result = await djangoSend(request, "/api/v1/grievances/actions/", "POST", body);
      logSensitiveMutation(request, subdomain, user, {
        action: `grievances.${body.action}`,
        entityType: "grievance",
        entityId: grievanceId,
        diff: [auditDiffLine("action", null, body.action)],
      });
      return NextResponse.json(result);
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Request failed" },
        { status: 400 },
      );
    }
  });
}
