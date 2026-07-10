import { NextResponse } from "next/server";
import { AuthError } from "@/lib/services/auth-server";
import * as authServer from "@/lib/services/auth-server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      resetToken?: string;
      newPassword?: string;
    };
    if (!body.resetToken || !body.newPassword) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    await authServer.confirmPasswordReset(
      body.resetToken,
      body.newPassword,
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof AuthError ? err.message : "Reset failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
