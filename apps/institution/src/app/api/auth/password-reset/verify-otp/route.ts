import { NextResponse } from "next/server";
import { AuthError } from "@/lib/services/auth-server";
import * as authServer from "@/lib/services/auth-server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      otpToken?: string;
      otpCode?: string;
    };
    if (!body.otpToken || !body.otpCode) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const result = await authServer.verifyOtp(
      body.otpToken,
      body.otpCode.trim(),
    );
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof AuthError ? err.message : "Invalid OTP";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
