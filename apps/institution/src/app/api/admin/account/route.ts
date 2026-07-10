import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/api";
import { DjangoApiError } from "@/lib/services/django-client";
import { getAdminAccountProfile } from "@/lib/services/account-server";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  try {
    const profile = await getAdminAccountProfile(request, auth.subdomain, auth.user);
    return NextResponse.json(profile);
  } catch (err) {
    const status = err instanceof DjangoApiError ? err.status || 500 : 500;
    const message = err instanceof Error ? err.message : "Failed to load account";
    return NextResponse.json({ error: message }, { status });
  }
}
