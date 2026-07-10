import { NextResponse } from "next/server";
import type { UpdateSuperAdminBranchSettingsInput } from "@eduos/types";
import { requireSuperAdmin, superAdminJson } from "@/lib/super-admin/api";
import * as superAdminServer from "@/lib/services/super-admin-server";
import { mapSuperAdminError } from "../../../errors";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ branchId: string }> },
) {
  const auth = await requireSuperAdmin(request);
  if (!auth.ok) return auth.response;

  const { branchId } = await context.params;
  const body = (await request.json().catch(() => null)) as UpdateSuperAdminBranchSettingsInput | null;
  if (!body) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  try {
    const { branch } = await superAdminServer.updateBranchSettings(
      request,
      auth.subdomain,
      branchId,
      body as Record<string, unknown>,
    );
    return superAdminJson(auth, { branch });
  } catch (err) {
    const { message, status } = mapSuperAdminError(err);
    return NextResponse.json({ error: message }, { status });
  }
}
