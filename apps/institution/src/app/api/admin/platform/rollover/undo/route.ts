import { requireAdmin } from "@/lib/admin/api";
import { withIdempotency } from "@/lib/admin/idempotency";
import { undoRollover } from "@/lib/services/rollover-server";
import { DjangoApiError } from "@/lib/services/django-client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  return withIdempotency(request, async () => {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    const stepUp = request.headers.get("X-Step-Up-Verified") === "true";

    try {
      const result = await undoRollover(request, stepUp);
      return NextResponse.json(result);
    } catch (err) {
      const message = err instanceof DjangoApiError ? err.message : "Undo failed";
      const status = err instanceof DjangoApiError ? err.status : 400;
      return NextResponse.json({ error: message }, { status });
    }
  });
}
