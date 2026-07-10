import { NextResponse } from "next/server";
import { AuthError } from "@/lib/services/auth-server";
import { clearAuthCookies } from "@/lib/auth/cookies";
import { getAccessTokenFromRequest } from "@/lib/auth/cookies";
import * as authServer from "@/lib/services/auth-server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      currentPassword?: string;
      newPassword?: string;
    };

    const currentPassword = body.currentPassword?.trim();
    const newPassword = body.newPassword?.trim();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required" },
        { status: 400 },
      );
    }

    const accessToken = getAccessTokenFromRequest(request);
    if (!accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await authServer.forceChangePassword({ accessToken, currentPassword, newPassword });

    // Clear all auth cookies — backend revoked tokens, force re-login
    const response = NextResponse.json({ type: "success" });
    clearAuthCookies(response);
    return response;
  } catch (err) {
    console.error("[auth/change-password]", err);
    const message =
      err instanceof AuthError
        ? err.message
        : err instanceof Error
          ? err.message
          : "Password change failed";
    const status = err instanceof AuthError ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
