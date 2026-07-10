import { NextResponse } from "next/server";
import type { TokenPair } from "@eduos/types";
import { apiFetch } from "@/lib/api/client";
import { applySessionCookies, resolveAuthSession, type ResolvedSession } from "@/lib/auth/session";
import { requireRole } from "@/lib/auth/require-role";
import { getTenantSubdomainFromRequest } from "@/lib/tenant";

export type FacultyAuthResult =
  | { ok: true; subdomain: string; facultyUserId: string; facultyName: string; session: ResolvedSession }
  | { ok: false; response: NextResponse };

export async function requireFaculty(request: Request): Promise<FacultyAuthResult> {
  const session = await resolveAuthSession(request);
  if (!session) {
    const response = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    applySessionCookies(response, null);
    return { ok: false, response };
  }
  if (session.user.role !== "faculty") {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  const subdomain = getTenantSubdomainFromRequest(request);
  return {
    ok: true,
    subdomain,
    facultyUserId: session.user.id,
    facultyName: session.user.name,
    session,
  };
}

/** JSON response with rotated auth cookies when apiFetch refreshed tokens. */
export function facultyJsonResponse(
  data: unknown,
  session: ResolvedSession,
  rotatedTokens?: TokenPair,
): NextResponse {
  const response = NextResponse.json(data);
  applySessionCookies(
    response,
    rotatedTokens ? { ...session, tokens: rotatedTokens } : session,
  );
  return response;
}

/** Authenticated faculty GET against Django `/api/v1` with cookie refresh. */
export async function facultyApiGet<T>(
  request: Request,
  path: string,
): Promise<
  | { ok: true; data: T; session: ResolvedSession; rotatedTokens?: TokenPair }
  | { ok: false; response: NextResponse }
> {
  const auth = await requireFaculty(request);
  if (!auth.ok) return auth;

  const result = await apiFetch<T>(request, path);
  if (!result.ok) {
    return {
      ok: false,
      response: NextResponse.json({ error: result.message }, { status: result.status }),
    };
  }
  return {
    ok: true,
    data: result.data,
    session: auth.session,
    rotatedTokens: result.tokens,
  };
}

