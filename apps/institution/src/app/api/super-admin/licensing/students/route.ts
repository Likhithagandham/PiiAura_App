import { NextResponse } from "next/server";
import type { StudentLicenseRow } from "@eduos/types";
import { requireSuperAdmin, superAdminJson } from "@/lib/super-admin/api";
import { djangoGet } from "@/lib/services/django-client";

export async function GET(request: Request) {
  const auth = await requireSuperAdmin(request);
  if (!auth.ok) return auth.response;

  const status = new URL(request.url).searchParams.get("status");
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  try {
    const data = await djangoGet<{ students: StudentLicenseRow[] }>(
      request,
      `/api/v1/organizations/licensing/students/${qs}`,
    );
    return superAdminJson(auth, data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load license roster";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
