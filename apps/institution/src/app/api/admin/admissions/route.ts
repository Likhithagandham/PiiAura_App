import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/api";
import { getAdmissionsData } from "@/lib/services/admissions.service";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  return NextResponse.json(await getAdmissionsData(request, auth.subdomain));
}
