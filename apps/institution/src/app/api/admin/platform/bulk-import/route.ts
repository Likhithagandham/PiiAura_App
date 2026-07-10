import { bridge } from "@/lib/services/route-bridge";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/api";
import { withIdempotency } from "@/lib/admin/idempotency";

export async function POST(request: Request) {
  return withIdempotency(request, async () => {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    const body = (await request.json()) as {
      rows?: Record<string, string>[];
      retryFailedOnly?: boolean;
    };

    const result = await bridge(request, {
      path: "/api/v1/admin/platform/bulk-import/",
      method: "POST",
      body: { rows: body.rows ?? [], retryFailedOnly: Boolean(body.retryFailedOnly) },
    });

    return NextResponse.json(result);
  });
}
