import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/api";
import { getAcademicsData } from "@/lib/services/academics-overview.service";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  return NextResponse.json(await getAcademicsData(request, auth.subdomain));
}
