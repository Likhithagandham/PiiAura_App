import { requireAdmin } from "@/lib/admin/api";
import { withIdempotency } from "@/lib/admin/idempotency";
import { getRolloverBundle } from "@/lib/services/rollover-server";
import { DjangoApiError } from "@/lib/services/django-client";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  try {
    const bundle = await getRolloverBundle(request);
    return NextResponse.json(bundle);
  } catch (err) {
    const message = err instanceof DjangoApiError ? err.message : "Could not load rollover preview.";
    return NextResponse.json({ error: message }, { status: err instanceof DjangoApiError ? err.status : 400 });
  }
}

export async function POST(request: Request) {
  return withIdempotency(request, async () => {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    const body = (await request.json()) as { expectedVersion?: number; version?: number };
    const expectedVersion = body.expectedVersion ?? body.version;
    if (expectedVersion == null) {
      return NextResponse.json({ error: "expectedVersion is required" }, { status: 400 });
    }

    try {
      const { executeRollover } = await import("@/lib/services/rollover-server");
      const result = await executeRollover(request, expectedVersion);
      return NextResponse.json(result, { status: result.async ? 202 : 200 });
    } catch (err) {
      const message = err instanceof DjangoApiError ? err.message : "Rollover failed";
      const status = err instanceof DjangoApiError ? err.status : 400;
      return NextResponse.json({ error: message }, { status });
    }
  });
}
