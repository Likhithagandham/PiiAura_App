import { NextResponse } from "next/server";
import { requireSuperAdmin, superAdminJson } from "@/lib/super-admin/api";
import * as superAdminServer from "@/lib/services/super-admin-server";
import { mapSuperAdminError } from "../../errors";

export async function PATCH(request: Request) {
  const auth = await requireSuperAdmin(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => null)) as
    | { action: "set_active"; branchId: string; isActive: boolean }
    | null;
  if (!body) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  try {
    switch (body.action) {
      case "set_active": {
        const { branch } = await superAdminServer.setBranchActive(request, auth.subdomain, {
          branchId: String(body.branchId ?? ""),
          isActive: Boolean(body.isActive),
        });
        return superAdminJson(auth, { branch });
      }
      default:
        return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
    }
  } catch (err) {
    const { message, status } = mapSuperAdminError(err);
    return NextResponse.json({ error: message }, { status });
  }
}
