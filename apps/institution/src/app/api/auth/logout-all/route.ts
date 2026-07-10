import { NextResponse } from "next/server";
import { clearAuthCookies, getAccessTokenFromRequest } from "@/lib/auth/cookies";
import * as authServer from "@/lib/services/auth-server";

export async function POST(request: Request) {
  const accessToken = getAccessTokenFromRequest(request);
  if (!accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await authServer.logoutAll(accessToken);

  const response = NextResponse.json({ ok: true });
  clearAuthCookies(response);
  return response;
}
