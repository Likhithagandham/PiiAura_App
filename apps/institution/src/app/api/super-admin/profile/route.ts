import { NextResponse } from "next/server";
import type { ChangeSuperAdminPasswordInput, UpdateSuperAdminProfileInput } from "@eduos/types";
import { requireSuperAdmin, superAdminJson } from "@/lib/super-admin/api";
import * as superAdminServer from "@/lib/services/super-admin-server";
import { mapSuperAdminError } from "../errors";

export async function GET(request: Request) {
  const auth = await requireSuperAdmin(request);
  if (!auth.ok) return auth.response;

  try {
    const profile = await superAdminServer.getProfile(request, auth.subdomain, auth.user);
    return superAdminJson(auth, profile);
  } catch (err) {
    const { message, status } = mapSuperAdminError(err);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(request: Request) {
  const auth = await requireSuperAdmin(request);
  if (!auth.ok) return auth.response;

  try {
    const body = (await request.json().catch(() => null)) as UpdateSuperAdminProfileInput | null;
    if (!body) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    const profile = await superAdminServer.updateProfile(request, auth.subdomain, auth.user, body);
    return superAdminJson(auth, profile);
  } catch (err) {
    const { message, status } = mapSuperAdminError(err);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request) {
  const auth = await requireSuperAdmin(request);
  if (!auth.ok) return auth.response;

  try {
    const body = (await request.json().catch(() => null)) as ChangeSuperAdminPasswordInput | null;
    if (!body) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    await superAdminServer.changePassword(request, auth.user.id, body);
    return superAdminJson(auth, { success: true });
  } catch (err) {
    const { message, status } = mapSuperAdminError(err);
    return NextResponse.json({ error: message }, { status });
  }
}
