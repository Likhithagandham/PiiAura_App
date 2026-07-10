import { NextResponse } from "next/server";
import type { UpdateNotificationChannelsInput } from "@eduos/types";
import { getAccessTokenFromRequest } from "@/lib/auth/cookies";
import { getTenantSubdomainFromRequest } from "@/lib/tenant";
import * as notificationsServer from "@/lib/services/notifications-server";

/** Lightweight auth error used for instanceof checks in catch blocks. */
class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export async function GET(request: Request) {
  const token = getAccessTokenFromRequest(request);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const subdomain = getTenantSubdomainFromRequest(request);
    const prefs = await notificationsServer.getPreferences(request, token, subdomain);
    return NextResponse.json(prefs);
  } catch (err) {
    const msg = err instanceof AuthError ? err.message : "Unauthorized";
    return NextResponse.json({ error: msg }, { status: 401 });
  }
}

export async function PATCH(request: Request) {
  const token = getAccessTokenFromRequest(request);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const subdomain = getTenantSubdomainFromRequest(request);
    const body = (await request.json()) as { channels?: UpdateNotificationChannelsInput };
    const prefs = await notificationsServer.updatePreferences(
      request,
      token,
      subdomain,
      body.channels ?? {},
    );
    return NextResponse.json(prefs);
  } catch (err) {
    const msg = err instanceof AuthError ? err.message : "Unauthorized";
    return NextResponse.json({ error: msg }, { status: 401 });
  }
}
