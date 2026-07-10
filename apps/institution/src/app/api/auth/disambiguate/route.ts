import { NextResponse } from "next/server";
import { AuthError } from "@/lib/services/auth-server";
import { setAuthCookies } from "@/lib/auth/cookies";
import { getTenantSubdomainFromRequest } from "@/lib/tenant";
import * as authServer from "@/lib/services/auth-server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      token?: string;
      userId?: string;
      password?: string;
    };

    if (!body.token || !body.userId || !body.password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const subdomain = getTenantSubdomainFromRequest(request);
    const result = await authServer.completeDisambiguation({
      token: body.token,
      userId: body.userId,
      password: body.password,
      subdomain,
    });

    const response = NextResponse.json({
      user: result.user,
      mustChangePassword: result.mustChangePassword,
    });
    setAuthCookies(response, result.tokens, result.user.institution_type);
    return response;
  } catch (err) {
    const message =
      err instanceof AuthError ? err.message : "Invalid credentials";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
