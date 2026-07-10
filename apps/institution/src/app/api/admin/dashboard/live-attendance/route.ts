import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/api";
import { getTenantSubdomainFromRequest } from "@/lib/tenant";
import * as adminServer from "@/lib/services/admin-server";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const subdomain = getTenantSubdomainFromRequest(request);
  try {
    const snapshot = await adminServer.getLiveAttendance(request, subdomain);
    return NextResponse.json(snapshot);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load live attendance";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
