import { NextResponse } from "next/server";
import { AuthError } from "@/lib/services/auth-server";
import { getAccessTokenFromRequest } from "@/lib/auth/cookies";
import * as authServer from "@/lib/services/auth-server";

export async function GET(request: Request) {
  try {
    const accessToken = getAccessTokenFromRequest(request);
    if (!accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const sessions = await authServer.listSessions(accessToken);
    return NextResponse.json({ sessions });
  } catch (err) {
    console.error("[auth/sessions GET]", err);
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}
