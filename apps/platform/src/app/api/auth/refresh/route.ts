import { NextResponse } from "next/server";
import { getRefreshTokenFromRequest, setAuthCookies } from "@/lib/auth/cookies";
import { refreshOnce } from "@/lib/auth/session";

export async function POST(request: Request) {
  const refreshToken = getRefreshTokenFromRequest(request);
  if (!refreshToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const tokens = await refreshOnce(refreshToken);
  if (!tokens) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const response = NextResponse.json({ ok: true });
  setAuthCookies(response, tokens);
  return response;
}
