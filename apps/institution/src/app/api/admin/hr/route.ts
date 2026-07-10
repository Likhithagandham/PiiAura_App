import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/api";
import { getHrData } from "@/lib/services/hr.service";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  const branchId = auth.user.branch_id ?? auth.user.branch ?? null;
  return NextResponse.json(await getHrData(request, auth.subdomain, branchId));
}
