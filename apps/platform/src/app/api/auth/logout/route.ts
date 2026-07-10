import { NextResponse } from "next/server";
import {
  clearAuthCookies,
  getAccessTokenFromRequest,
  getRefreshTokenFromRequest,
} from "@/lib/auth/cookies";
import * as authServer from "@/lib/services/platform-auth-server";

export async function POST(request: Request) {
  const accessToken = getAccessTokenFromRequest(request);
  const refreshToken = getRefreshTokenFromRequest(request);
  await authServer.logout(accessToken, refreshToken);
  const response = NextResponse.json({ ok: true });
  clearAuthCookies(response);
  return response;
}
