import { NextResponse } from "next/server";
import { requireSuperAdmin, superAdminJson } from "@/lib/super-admin/api";
import * as superAdminServer from "@/lib/services/super-admin-server";
import { mapSuperAdminError } from "../../errors";

export async function PATCH(request: Request) {
  const auth = await requireSuperAdmin(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => null)) as
    | { action: "set_active"; adminId: string; isActive: boolean }
    | { action: "set_branch"; adminId: string; branchId: string }
    | null;
  if (!body) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  try {
    switch (body.action) {
      case "set_active": {
        const { admin } = await superAdminServer.setAdminActive(request, auth.subdomain, {
          adminId: String(body.adminId ?? ""),
          isActive: Boolean(body.isActive),
        });
        return superAdminJson(auth, { admin });
      }
      case "set_branch": {
        const { admin } = await superAdminServer.setAdminBranch(request, auth.subdomain, {
          adminId: String(body.adminId ?? ""),
          branchId: String(body.branchId ?? ""),
        });
        return superAdminJson(auth, { admin });
      }
      default:
        return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
    }
  } catch (err) {
    const { message, status } = mapSuperAdminError(err);
    return NextResponse.json({ error: message }, { status });
  }
}
