import { NextResponse } from "next/server";
import type { SuperAdminNotificationPrefs } from "@eduos/types";
import { requireSuperAdmin, superAdminJson } from "@/lib/super-admin/api";
import * as superAdminServer from "@/lib/services/super-admin-server";
import { mapSuperAdminError } from "../errors";

export async function GET(request: Request) {
  const auth = await requireSuperAdmin(request);
  if (!auth.ok) return auth.response;

  try {
    const prefs = await superAdminServer.getNotificationPrefs(request, auth.subdomain, auth.user.id);
    return superAdminJson(auth, prefs);
  } catch (err) {
    const { message, status } = mapSuperAdminError(err);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(request: Request) {
  const auth = await requireSuperAdmin(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => null)) as Partial<SuperAdminNotificationPrefs> | null;
  if (!body) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  try {
    const prefs = await superAdminServer.updateNotificationPrefs(
      request,
      auth.subdomain,
      auth.user.id,
      body as Partial<SuperAdminNotificationPrefs>,
    );
    return superAdminJson(auth, prefs);
  } catch (err) {
    const { message, status } = mapSuperAdminError(err);
    return NextResponse.json({ error: message }, { status });
  }
}
