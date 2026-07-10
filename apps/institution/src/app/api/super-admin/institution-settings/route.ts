import { NextResponse } from "next/server";
import type { InstitutionAddress, UpdateTenantInstitutionSettingsInput } from "@eduos/types";
import { requireSuperAdmin, superAdminJson } from "@/lib/super-admin/api";
import * as authServer from "@/lib/services/auth-server";
import * as superAdminServer from "@/lib/services/super-admin-server";
import { mapSuperAdminError, tenantSeedFromConfig } from "../errors";

function normalizeAddress(a: InstitutionAddress): InstitutionAddress {
  return {
    line1: a.line1 ?? "",
    line2: a.line2 ?? "",
    city: a.city ?? "",
    state: a.state ?? "",
    pincode: a.pincode ?? "",
  };
}

export async function GET(request: Request) {
  const auth = await requireSuperAdmin(request);
  if (!auth.ok) return auth.response;

  try {
    const cfg = await authServer.getTenantLoginConfig(auth.subdomain);
    const data = await superAdminServer.getInstitutionSettings(request, auth.subdomain);
    return superAdminJson(auth, data);
  } catch (err) {
    const { message, status } = mapSuperAdminError(err);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(request: Request) {
  const auth = await requireSuperAdmin(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => null)) as Partial<UpdateTenantInstitutionSettingsInput> | null;
  if (!body) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  try {
    const cfg = await authServer.getTenantLoginConfig(auth.subdomain);
    const current = await superAdminServer.getInstitutionSettings(request, auth.subdomain);

    if (current.goLiveAt && body.institutionType && body.institutionType !== current.institutionType) {
      return NextResponse.json({ error: "Institution type cannot be changed after go-live." }, { status: 400 });
    }

    const nextType = body.institutionType ?? current.institutionType;
    if (body.parentPortalEnabled !== undefined && nextType !== "college") {
      return NextResponse.json(
        { error: "Parent portal access applies only to college institutions." },
        { status: 400 },
      );
    }

    const input: UpdateTenantInstitutionSettingsInput = {
      institutionName: body.institutionName ?? current.institutionName,
      institutionType: nextType,
      logoUrl: body.logoUrl !== undefined ? (body.logoUrl.trim() || "") : (current.logoUrl ?? ""),
      address: body.address ? normalizeAddress(body.address) : current.address,
      parentPortalEnabled: body.parentPortalEnabled,
    };

    const updated = await superAdminServer.updateInstitutionSettings(
      request,
      auth.subdomain,
      input
    );
    return superAdminJson(auth, updated);
  } catch (err) {
    const { message, status } = mapSuperAdminError(err);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request) {
  const auth = await requireSuperAdmin(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => null)) as { action: "go_live" | "undo_go_live" } | null;
  if (!body) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  try {
    const cfg = await authServer.getTenantLoginConfig(auth.subdomain);
    const current = await superAdminServer.getInstitutionSettings(request, auth.subdomain);
    const updated = await superAdminServer.goLiveInstitution(
      request,
      auth.subdomain,
      body.action,
    );
    return superAdminJson(auth, updated);
  } catch (err) {
    const { message, status } = mapSuperAdminError(err);
    return NextResponse.json({ error: message }, { status });
  }
}
