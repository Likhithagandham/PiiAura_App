import { bridge } from "@/lib/services/route-bridge";
import type { SaveElectiveRuleInput } from "@eduos/types";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/api";
import { withIdempotency } from "@/lib/admin/idempotency";
import { logSensitiveMutation } from "@/lib/admin/audit-log";
import { getClientIp } from "@/lib/admin/request-meta";

export async function PATCH(request: Request) {
  return withIdempotency(request, async () => {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    const body = (await request.json()) as { action?: string; payload?: unknown; [k: string]: unknown };
    const action = String(body.action ?? "");

    try {
      switch (action) {
        case "save_elective_rule":
          return NextResponse.json(
            await bridge(request, {
              path: "/api/v1/admin/college/elective-rules/",
              method: "PATCH",
              body: {
                ...(body.payload as SaveElectiveRuleInput),
                audit: {
                  actorId: auth.user.id,
                  actorName: auth.user.name,
                  actorRole: auth.user.role,
                  ipAddress: getClientIp(request),
                },
              },
            }),
          );
        case "naac_gaps":
          return NextResponse.json(
            await bridge(request, { path: "/api/v1/admin/college/naac/gaps/" }),
          );
        case "export_naac": {
          const r = await bridge<{ content: string; fileName: string; gaps: unknown[] }>(request, {
            path: "/api/v1/admin/college/naac/export/",
          });
          logSensitiveMutation(request, auth.subdomain, auth.user, {
            action: "college.export.naac",
            entityType: "export",
            entityId: r.fileName,
            diff: [{ field: "gapCount", before: null, after: String(r.gaps.length) }],
          });
          return new NextResponse(r.content, {
            headers: {
              "Content-Type": "text/csv",
              "Content-Disposition": `attachment; filename="${r.fileName}"`,
              "X-Naac-Gap-Count": String(r.gaps.length),
            },
          });
        }
        case "export_nirf": {
          const r = await bridge<{ content: string; fileName: string }>(request, {
            path: "/api/v1/admin/college/nirf/export/",
          });
          logSensitiveMutation(request, auth.subdomain, auth.user, {
            action: "college.export.nirf",
            entityType: "export",
            entityId: r.fileName,
            diff: [],
          });
          return new NextResponse(r.content, {
            headers: {
              "Content-Type": "text/csv",
              "Content-Disposition": `attachment; filename="${r.fileName}"`,
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
