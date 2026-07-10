import { NextResponse } from "next/server";
import type { AuthUser, TokenPair } from "@eduos/types";
import { getAccessTokenFromRequest, setAuthCookies } from "@/lib/auth/cookies";
import { requireRole } from "@/lib/auth/require-role";
import { getTenantSubdomainFromRequest } from "@/lib/tenant";

export type SuperAdminAuthOk = {
  subdomain: string;
  user: AuthUser;
  accessToken: string;
  sessionTokens?: TokenPair;
};

export type SuperAdminAuthResult =
  | ({ ok: true } & SuperAdminAuthOk)
  | { ok: false; response: NextResponse };

export async function requireSuperAdmin(request: Request): Promise<SuperAdminAuthResult> {
  const auth = await requireRole(request, "super_admin");
  if ("error" in auth) {
    return {
      ok: false,
      response: NextResponse.json({ error: auth.error }, { status: auth.status }),
    };
  }
  const subdomain = getTenantSubdomainFromRequest(request);
  const accessToken = auth.tokens?.accessToken ?? getAccessTokenFromRequest(request);
  if (!accessToken) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { ok: true, subdomain, user: auth.user, accessToken, sessionTokens: auth.tokens };
}

export function applySuperAdminSessionCookies(
  response: NextResponse,
  auth: SuperAdminAuthOk,
): NextResponse {
  if (auth.sessionTokens) {
    setAuthCookies(response, auth.sessionTokens);
  }
  return response;
}

export function superAdminJson(auth: SuperAdminAuthOk, data: unknown, init?: ResponseInit): NextResponse {
  return applySuperAdminSessionCookies(NextResponse.json(data, init), auth);
}

