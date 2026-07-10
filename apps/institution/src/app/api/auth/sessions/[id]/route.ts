import { NextResponse } from "next/server";
import { AuthError } from "@/lib/services/auth-server";
import { getAccessTokenFromRequest } from "@/lib/auth/cookies";
import * as authServer from "@/lib/services/auth-server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const accessToken = getAccessTokenFromRequest(request);
    if (!accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await authServer.revokeSession(accessToken, id);
    return NextResponse.json({ type: "success" });
  } catch (err) {
    console.error("[auth/sessions/[id] DELETE]", err);
    const message =
      err instanceof AuthError
        ? err.message
        : "Failed to revoke session";
    const status = err instanceof AuthError ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
