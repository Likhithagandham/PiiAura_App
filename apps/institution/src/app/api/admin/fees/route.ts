import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/api";
import { getFeesData } from "@/lib/services/fees.service";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  return NextResponse.json(await getFeesData(request, auth.subdomain));
}
