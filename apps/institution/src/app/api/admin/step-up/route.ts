import { requireAdmin } from "@/lib/admin/api";
import { djangoSend, DjangoApiError } from "@/lib/services/django-client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  try {
    const body = (await request.json()) as { password?: string };
    const result = await djangoSend<{ verified: boolean }>(
      request,
      "/api/v1/auth/step-up/",
      "POST",
      { password: body.password },
    );
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof DjangoApiError ? err.message : "Verification failed";
    return NextResponse.json({ error: message }, { status: err instanceof DjangoApiError ? err.status : 400 });
  }
}
