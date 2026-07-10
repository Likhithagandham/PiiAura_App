import { getExaminationsData } from "@/lib/services/examinations-server";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/api";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  return NextResponse.json(await getExaminationsData(request, auth.subdomain));
}

