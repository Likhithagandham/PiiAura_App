import { NextResponse } from "next/server";
import type { SchoolLicenseSummary } from "@eduos/types";
import { requireAdmin } from "@/lib/admin/api";
import { djangoGet } from "@/lib/services/django-client";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  try {
    const data = await djangoGet<SchoolLicenseSummary>(
      request,
      "/api/v1/organizations/licensing/summary/",
    );
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load licensing summary";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
