import { NextResponse } from "next/server";
import { applySessionCookies, resolveAuthSession } from "@/lib/auth/session";

export async function GET(request: Request) {
  const session = await resolveAuthSession(request);

  if (!session) {
    // 200 + null user: not logged in (avoids noisy 401s on login page; cookies cleared if invalid)
    const response = NextResponse.json({ user: null });
    applySessionCookies(response, null);
    return response;
  }

  const response = NextResponse.json({ user: session.user });
  applySessionCookies(response, session);
  return response;
}
