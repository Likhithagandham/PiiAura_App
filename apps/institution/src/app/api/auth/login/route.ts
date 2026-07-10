import { NextResponse } from "next/server";
import { AuthError } from "@/lib/services/auth-server";
import { setAuthCookies } from "@/lib/auth/cookies";
import { getTenantSubdomainFromRequest } from "@/lib/tenant";
import * as authServer from "@/lib/services/auth-server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      identifier?: string;
      password?: string;
    };
    const identifier = body.identifier?.trim();
    const password = body.password?.trim() ?? "";

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Identifier and password are required" },
        { status: 400 },
      );
    }

    const subdomain = getTenantSubdomainFromRequest(request);
    const ua = request.headers.get("user-agent") ?? "";
    const isMobile = /mobile|android|iphone|ipad/i.test(ua);
    const result = await authServer.login({
      identifier,
      password,
      subdomain,
      deviceType: isMobile ? "mobile" : "desktop",
      deviceLabel: isMobile ? "Mobile browser" : "Desktop browser",
    });

    if (result.type === "success" || result.type === "force_change_password") {
      const response = NextResponse.json({
        type: result.type,
        user: result.user,
      });
      setAuthCookies(response, result.tokens, result.user.institution_type);
      return response;
    }

    if (result.type === "mfa_required") {
      return NextResponse.json({
        type: "mfa_required",
        mfaSessionToken: result.mfaSessionToken,
        emailHint: result.emailHint,
      });
    }

    return NextResponse.json({
      type: "disambiguation",
      token: result.token,
      accounts: result.accounts,
    });
  } catch (err) {
    // A wrong password / unknown user is an EXPECTED outcome (a 401), not a crash —
    // log it as a clean one-liner, no stack trace. Only genuinely unexpected failures
    // (e.g. the backend is unreachable → 500) get the full error dump.
    if (err instanceof AuthError) {
      console.info(`[auth/login] rejected: ${err.message}`);
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("[auth/login] unexpected error:", err);
    const message =
      err instanceof Error && /fetch failed|ECONNREFUSED/i.test(err.message)
        ? "Cannot reach the authentication server. Please try again shortly."
        : err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
