import { NextResponse } from "next/server";
import { AuthError } from "@/lib/services/auth-server";
import * as authServer from "@/lib/services/auth-server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { otpToken?: string };
    if (!body.otpToken) {
      return NextResponse.json({ error: "Missing otpToken" }, { status: 400 });
    }
    await authServer.resendOtp(body.otpToken);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof AuthError ? err.message : "Resend failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
