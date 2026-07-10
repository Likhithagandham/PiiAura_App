import type { SaveGuardianLinkInput } from "@eduos/types";
import { NextResponse } from "next/server";
import { auditDiffLine, logSensitiveMutation } from "@/lib/admin/audit-log";
import { requireAdmin } from "@/lib/admin/api";
import { withIdempotency } from "@/lib/admin/idempotency";
import {
  removeGuardianLink,
  saveGuardianLink,
  setGuardianPrimary,
} from "@/lib/services/guardians.service";

export async function PATCH(request: Request) {
  return withIdempotency(request, async () => {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    const body = (await request.json()) as { action?: string; payload?: unknown; linkId?: string };
    const action = String(body.action ?? "");

    try {
      switch (action) {
        case "save_link": {
          const payload = body.payload as SaveGuardianLinkInput;
          const result = await saveGuardianLink(request, payload);
          logSensitiveMutation(request, auth.subdomain, auth.user, {
            action: payload.id ? "guardians.link.update" : "guardians.link.create",
            entityType: "guardian_link",
            entityId: String((result as { id?: string }).id ?? payload.id ?? ""),
            diff: [
              auditDiffLine("studentId", null, payload.studentId),
              auditDiffLine("guardianUserId", null, payload.guardianUserId),
            ],
          });
          return NextResponse.json(result);
        }
        case "remove_link": {
          const linkId = String(body.linkId ?? "");
          const result = await removeGuardianLink(request, linkId);
          logSensitiveMutation(request, auth.subdomain, auth.user, {
            action: "guardians.link.remove",
            entityType: "guardian_link",
            entityId: linkId,
            diff: [],
          });
          return NextResponse.json(result);
        }
        case "set_primary": {
          const linkId = String(body.linkId ?? "");
          const result = await setGuardianPrimary(request, linkId);
          logSensitiveMutation(request, auth.subdomain, auth.user, {
            action: "guardians.link.set_primary",
            entityType: "guardian_link",
            entityId: linkId,
            diff: [auditDiffLine("isPrimaryContact", "false", "true")],
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
