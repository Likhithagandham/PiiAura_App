import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/api";
import { getTenantSubdomainFromRequest } from "@/lib/tenant";
import * as adminServer from "@/lib/services/admin-server";
import { jsonCached } from "@/lib/api/cache";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const subdomain = getTenantSubdomainFromRequest(request);
  try {
    const data = await adminServer.getDashboard(request, subdomain);
    return jsonCached(data, 60);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load dashboard";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
