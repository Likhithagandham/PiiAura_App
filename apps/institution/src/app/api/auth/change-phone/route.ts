import { NextResponse } from "next/server";
import { AuthError } from "@/lib/services/auth-server";
import { getAccessTokenFromRequest } from "@/lib/auth/cookies";
import * as authServer from "@/lib/services/auth-server";

/** POST /api/auth/change-phone — body: { action: "initiate"|"confirm", newPhone?, otp? } */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      action?: string;
      newPhone?: string;
      otp?: string;
    };

    const accessToken = getAccessTokenFromRequest(request);
    if (!accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (body.action === "initiate") {
      const newPhone = body.newPhone?.trim();
      if (!newPhone) {
        return NextResponse.json({ error: "newPhone is required" }, { status: 400 });
      }
      await authServer.initiatePhoneChange(accessToken, newPhone);
      return NextResponse.json({ type: "otp_sent" });
    }

    if (body.action === "confirm") {
      const otp = body.otp?.trim();
      if (!otp) {
        return NextResponse.json({ error: "otp is required" }, { status: 400 });
      }
      await authServer.confirmPhoneChange(accessToken, otp);
      return NextResponse.json({ type: "success" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("[auth/change-phone]", err);
    const message =
      err instanceof AuthError
        ? err.message
        : err instanceof Error
          ? err.message
          : "Request failed";
    const status = err instanceof AuthError ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
