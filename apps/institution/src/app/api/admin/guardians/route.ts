import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/api";
import { getGuardianData } from "@/lib/services/guardians.service";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  return NextResponse.json(await getGuardianData(request, auth.subdomain));
}
