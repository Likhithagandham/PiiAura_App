import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { getTenantSubdomainFromRequest } from "@/lib/tenant";
import * as authServer from "@/lib/services/auth-server";
import * as tenantServer from "@/lib/services/tenant-server";

/**
 * Branding depends only on the tenant subdomain (no per-user data), so we cache
 * the two upstream Django calls per subdomain for 5 minutes. This turns the
 * repeated ~1.5s round-trips seen in the logs into a near-instant cache hit.
 * Bust with `revalidateTag("tenant-branding")` when branding is edited.
 */
const getCachedBranding = unstable_cache(
  async (subdomain: string) => {
    const cfg = await authServer.getTenantLoginConfig(subdomain);
    return tenantServer.getTenantBrandingView(subdomain, cfg);
  },
  ["tenant-branding"],
  { revalidate: 300, tags: ["tenant-branding"] },
);

export async function GET(request: Request) {
  const subdomain = getTenantSubdomainFromRequest(request);
  try {
    const branding = await getCachedBranding(subdomain);
    return NextResponse.json(branding);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
