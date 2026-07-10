import { NextResponse } from "next/server";
import { AuthError } from "@/lib/services/auth-server";
import { setAuthCookies } from "@/lib/auth/cookies";
import { getTenantSubdomainFromRequest } from "@/lib/tenant";
import * as authServer from "@/lib/services/auth-server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      token?: string;
      newPassword?: string;
    };

    if (!body.token || !body.newPassword) {
      return NextResponse.json({ error: "token and newPassword are required" }, { status: 400 });
    }

    const subdomain = getTenantSubdomainFromRequest(request);
    const result = await authServer.acceptInvite({
      token: body.token,
      newPassword: body.newPassword,
      subdomain,
    });

    const response = NextResponse.json({ type: "success", user: result.user });
    setAuthCookies(response, result.tokens, result.user.institution_type);
    return response;
  } catch (err) {
    const message =
      err instanceof AuthError
        ? err.message
        : err instanceof Error
          ? err.message
          : "Failed to accept invite";
    const status = err instanceof AuthError ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
