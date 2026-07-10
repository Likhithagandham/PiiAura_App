import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/api";
import { getSchoolData } from "@/lib/services/school-server";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  return NextResponse.json(await getSchoolData(request, auth.subdomain));
}
