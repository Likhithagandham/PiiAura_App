import type { AdminGrievancesData } from "@eduos/types";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/api";
import { djangoGet } from "@/lib/services/django-client";

/** F-255 — admin grievance inbox (student + parent). */
export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  return NextResponse.json(
    await djangoGet<AdminGrievancesData>(request, "/api/v1/grievances/"),
  );
}
