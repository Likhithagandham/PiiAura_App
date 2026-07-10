import { NextResponse } from "next/server";
import { getTenantSubdomainFromRequest } from "@/lib/tenant";
import * as authServer from "@/lib/services/auth-server";

export async function GET(request: Request) {
  const subdomain = getTenantSubdomainFromRequest(request);

  try {
    const config = await authServer.getTenantLoginConfig(subdomain);
    return NextResponse.json(config);
  } catch (err) {
    console.error("Error resolving tenant-config:", err);
    const message =
      err instanceof Error ? err.message : "Failed to resolve tenant config";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
