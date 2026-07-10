import { NextResponse } from "next/server";
import type { UpdateTenantBrandingInput } from "@eduos/types";
import { requireSuperAdmin, superAdminJson } from "@/lib/super-admin/api";
import * as authServer from "@/lib/services/auth-server";
import * as superAdminServer from "@/lib/services/super-admin-server";
import { mapSuperAdminError, tenantSeedFromConfig } from "../errors";

export async function GET(request: Request) {
  const auth = await requireSuperAdmin(request);
  if (!auth.ok) return auth.response;

  try {
    const cfg = await authServer.getTenantLoginConfig(auth.subdomain);
    const settings = await superAdminServer.getInstitutionSettings(request, auth.subdomain);
    return superAdminJson(auth, {
      institutionName: settings.institutionName,
      logoUrl: settings.logoUrl,
      brandColor: null,
    });
  } catch (err) {
    const { message, status } = mapSuperAdminError(err);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(request: Request) {
  const auth = await requireSuperAdmin(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => null)) as Partial<UpdateTenantBrandingInput> | null;
  if (!body) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  if (body.brandColor !== undefined && body.logoUrl === undefined) {
    return NextResponse.json({ error: "Brand color updates are not yet supported." }, { status: 501 });
  }

  try {
    const cfg = await authServer.getTenantLoginConfig(auth.subdomain);
    const current = await superAdminServer.getInstitutionSettings(request, auth.subdomain);

    const updated = await superAdminServer.updateInstitutionSettings(
      request,
      auth.subdomain,
      {
        institutionName: current.institutionName,
        institutionType: current.institutionType,
        logoUrl: body.logoUrl !== undefined ? (body.logoUrl.trim() || "") : (current.logoUrl ?? ""),
        address: current.address,
      }
    );

    return superAdminJson(auth, {
      institutionName: updated.institutionName,
      logoUrl: updated.logoUrl,
      brandColor: body.brandColor?.trim() || null,
    });
  } catch (err) {
    const { message, status } = mapSuperAdminError(err);
    return NextResponse.json({ error: message }, { status });
  }
}
