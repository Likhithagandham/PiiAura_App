import { NextResponse } from "next/server";
import {
  clearAuthCookies,
  getAccessTokenFromRequest,
  getRefreshTokenFromRequest,
} from "@/lib/auth/cookies";
import * as authServer from "@/lib/services/auth-server";

export async function POST(request: Request) {
  await authServer.logout({
    accessToken: getAccessTokenFromRequest(request),
    refreshToken: getRefreshTokenFromRequest(request),
  });

  const response = NextResponse.json({ ok: true });
  clearAuthCookies(response);
  return response;
}
