import { NextResponse } from "next/server";
import { AuthError } from "@/lib/services/platform-auth-server";
import { setAuthCookies } from "@/lib/auth/cookies";
import * as authServer from "@/lib/services/platform-auth-server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { identifier?: string; password?: string };
    const identifier = body.identifier?.trim();
    const password = body.password?.trim() ?? "";

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Identifier and password are required" },
        { status: 400 },
      );
    }

    const ua = request.headers.get("user-agent") ?? "";
    const isMobile = /mobile|android|iphone|ipad/i.test(ua);
    const result = await authServer.login({
      identifier,
      password,
      deviceType: isMobile ? "mobile" : "desktop",
      deviceLabel: isMobile ? "Mobile browser" : "Desktop browser",
    });

    if (result.type === "success") {
      const response = NextResponse.json({ type: "success", user: result.user });
      setAuthCookies(response, result.tokens);
      return response;
    }

    if (result.type === "mfa_required") {
      return NextResponse.json({
        type: "mfa_required",
        mfaSessionToken: result.mfaSessionToken,
        emailHint: result.emailHint,
      });
    }

    if (result.type === "disambiguation") {
      return NextResponse.json({
        type: "disambiguation",
        token: result.token,
        accounts: result.accounts,
      });
    }

    return NextResponse.json({ error: "Unexpected login response" }, { status: 500 });
  } catch (err) {
    const message =
      err instanceof AuthError
        ? err.message
        : err instanceof Error
          ? err.message
          : "Invalid credentials";
    const status = err instanceof AuthError ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
