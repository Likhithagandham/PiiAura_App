import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/api";
import { withIdempotency } from "@/lib/admin/idempotency";

export async function POST(request: Request) {
  return withIdempotency(request, async () => {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    return NextResponse.json(
      {
        error:
          "Transfer applications are demo-only. Capture a new enquiry for transfer students in production.",
      },
      { status: 501 },
    );
  });
}
