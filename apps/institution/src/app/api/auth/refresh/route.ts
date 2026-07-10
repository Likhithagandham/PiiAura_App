import { NextResponse } from "next/server";
import { applySessionCookies, resolveAuthSession } from "@/lib/auth/session";
import { getRefreshTokenFromRequest } from "@/lib/auth/cookies";

/**
 * POST /api/auth/refresh
 * Issue new access (+ refresh) cookies when access is missing or expired.
 */
export async function POST(request: Request) {
  const refreshToken = getRefreshTokenFromRequest(request);
  if (!refreshToken) {
    const response = NextResponse.json(
      { error: "No refresh token" },
      { status: 401 },
    );
    applySessionCookies(response, null);
    return response;
  }

  const session = await resolveAuthSession(request);

  if (!session) {
    const response = NextResponse.json(
      { error: "Session expired" },
      { status: 401 },
    );
    applySessionCookies(response, null);
    return response;
  }

  const response = NextResponse.json({ ok: true, user: session.user });
  applySessionCookies(response, session);
  return response;
}
