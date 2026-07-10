import { NextResponse } from "next/server";
import { AuthError } from "@/lib/services/auth-server";
import { applySessionCookies, resolveAuthSession } from "@/lib/auth/session";
import { getAccessTokenFromRequest } from "@/lib/auth/cookies";
import * as authServer from "@/lib/services/auth-server";

export async function GET(request: Request) {
  const session = await resolveAuthSession(request);

  if (!session) {
    const response = NextResponse.json({ accounts: [] });
    applySessionCookies(response, null);
    return response;
  }

  const accessToken = getAccessTokenFromRequest(request);
  if (!accessToken) {
    return NextResponse.json({ accounts: [] });
  }

  try {
    const accounts = await authServer.listLinkedAccounts(accessToken);
    const response = NextResponse.json({ accounts });
    applySessionCookies(response, session);
    return response;
  } catch (err) {
    const message = err instanceof AuthError ? err.message : "Unauthorized";
    const status = err instanceof AuthError ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
