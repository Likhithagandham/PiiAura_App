import { NextResponse } from "next/server";
import { AuthError } from "@/lib/services/platform-auth-server";
import { setAuthCookies } from "@/lib/auth/cookies";
import * as authServer from "@/lib/services/platform-auth-server";

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

    const result = await authServer.verifyMfaOtp({ mfaSessionToken, otp });

    const response = NextResponse.json({ type: "success", user: result.user });
    setAuthCookies(response, result.tokens);
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
