import { NextResponse } from "next/server";
import { AuthError } from "@/lib/services/auth-server";
import { setAuthCookies } from "@/lib/auth/cookies";
import { getTenantSubdomainFromRequest } from "@/lib/tenant";
import * as authServer from "@/lib/services/auth-server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      mfaSessionToken?: string;
      otp?: string;
    };

    const mfaSessionToken = body.mfaSessionToken?.trim();
    const otp = body.otp?.trim();

    if (!mfaSessionToken || !otp) {
      return NextResponse.json(
        { error: "mfaSessionToken and otp are required" },
        { status: 400 },
      );
    }

    const subdomain = getTenantSubdomainFromRequest(request);
    const result = await authServer.verifyMfaOtp({ mfaSessionToken, otp, subdomain });

    const response = NextResponse.json({ type: "success", user: result.user });
    setAuthCookies(response, result.tokens, result.user.institution_type);
    return response;
  } catch (err) {
    const message =
      err instanceof AuthError
        ? err.message
        : err instanceof Error
          ? err.message
          : "Verification failed";
    const status = err instanceof AuthError ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
