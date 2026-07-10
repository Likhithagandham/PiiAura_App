import { requireSuperAdmin, superAdminJson } from "@/lib/super-admin/api";
import * as superAdminServer from "@/lib/services/super-admin-server";
import { mapSuperAdminError } from "../../errors";

export async function GET(request: Request) {
  const auth = await requireSuperAdmin(request);
  if (!auth.ok) return auth.response;

  const branchId = new URL(request.url).searchParams.get("branchId")?.trim();
  if (!branchId) {
    return superAdminJson(auth, { error: "branchId is required" }, { status: 400 });
  }

  try {
    const data = await superAdminServer.getBranchFeeLedger(request, auth.subdomain, branchId);
    return superAdminJson(auth, data);
  } catch (err) {
    const { message, status } = mapSuperAdminError(err);
    return superAdminJson(auth, { error: message }, { status });
  }
}
