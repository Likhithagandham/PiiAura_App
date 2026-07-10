import { bridge } from "@/lib/services/route-bridge";
import type { SendCommsMessageInput } from "@eduos/types";
import { NextResponse } from "next/server";
import { auditDiffLine, logSensitiveMutation } from "@/lib/admin/audit-log";
import { requireAdmin } from "@/lib/admin/api";
import { withIdempotency } from "@/lib/admin/idempotency";

export async function PATCH(request: Request) {
  return withIdempotency(request, async () => {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    const body = (await request.json()) as { action?: string; payload?: unknown; [k: string]: unknown };
    const action = String(body.action ?? "");

    try {
      switch (action) {
        case "send": {
          const payload = body.payload as SendCommsMessageInput;
          const result = await bridge<{ id: string }>(request, {
            path: "/api/v1/admin/communications/send/",
            method: "POST",
            body: payload,
          });
          logSensitiveMutation(request, auth.subdomain, auth.user, {
            action: "communications.message.send",
            entityType: "comms_message",
            entityId: result.id,
            diff: [
              auditDiffLine("channels", null, payload.channels.join(",")),
              auditDiffLine("target", null, payload.target.type),
            ],
          });
          return NextResponse.json(result);
        }
        case "process_queue": {
          const result = await bridge<{ processed?: number }>(request, {
            path: "/api/v1/admin/communications/queue/process/",
            method: "POST",
          });
          logSensitiveMutation(request, auth.subdomain, auth.user, {
            action: "communications.queue.process",
            entityType: "comms_queue",
            entityId: auth.subdomain,
            diff: [auditDiffLine("processed", null, String(result.processed ?? 0))],
          });
          return NextResponse.json(result);
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
