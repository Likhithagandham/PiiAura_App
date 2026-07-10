import { NextResponse } from "next/server";
import { AuthError } from "@/lib/services/auth-server";
import { getAccessTokenFromRequest } from "@/lib/auth/cookies";
import * as authServer from "@/lib/services/auth-server";

/** POST /api/auth/change-email — body: { action: "initiate"|"confirm", newEmail?, otp? } */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      action?: string;
      newEmail?: string;
      otp?: string;
    };

    const accessToken = getAccessTokenFromRequest(request);
    if (!accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (body.action === "initiate") {
      const newEmail = body.newEmail?.trim();
      if (!newEmail) {
        return NextResponse.json({ error: "newEmail is required" }, { status: 400 });
      }
      await authServer.initiateEmailChange(accessToken, newEmail);
      return NextResponse.json({ type: "otp_sent" });
    }

    if (body.action === "confirm") {
      const otp = body.otp?.trim();
      if (!otp) {
        return NextResponse.json({ error: "otp is required" }, { status: 400 });
      }
      await authServer.confirmEmailChange(accessToken, otp);
      return NextResponse.json({ type: "success" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("[auth/change-email]", err);
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
