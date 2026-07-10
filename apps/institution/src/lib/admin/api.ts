import { NextResponse } from "next/server";
import type { AuthUser } from "@eduos/types";
import { requireRole } from "@/lib/auth/require-role";
import { getTenantSubdomainFromRequest } from "@/lib/tenant";

export type AdminAuthResult =
  | { ok: true; subdomain: string; user: AuthUser }
  | { ok: false; response: NextResponse };

export async function requireAdmin(request: Request): Promise<AdminAuthResult> {
  const auth = await requireRole(request, "admin");
  if ("error" in auth) {
    return {
      ok: false,
      response: NextResponse.json({ error: auth.error }, { status: auth.status }),
    };
  }
  const subdomain = getTenantSubdomainFromRequest(request);
  return { ok: true, subdomain, user: auth.user };
}
