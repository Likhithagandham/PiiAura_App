import { requireSuperAdmin, superAdminJson } from "@/lib/super-admin/api";
import { getGuardianData } from "@/lib/services/guardians.service";
import { mapSuperAdminError } from "../errors";

function branchQuery(request: Request): string {
  const url = new URL(request.url);
  return url.searchParams.get("branch") ?? "all";
}

function classQuery(request: Request): string | null {
  const url = new URL(request.url);
  return url.searchParams.get("class");
}

export async function GET(request: Request) {
  const auth = await requireSuperAdmin(request);
  if (!auth.ok) return auth.response;

  const bq = branchQuery(request);
  const cq = classQuery(request);
  try {
    const data = await getGuardianData(request, auth.subdomain, bq, cq);
    return superAdminJson(auth, { ...data, branchScope: data.branchScope ?? bq });
  } catch (err) {
    const { message, status } = mapSuperAdminError(err);
    return superAdminJson(auth, { error: message }, { status });
  }
}

export async function POST(request: Request) {
  const auth = await requireSuperAdmin(request);
  if (!auth.ok) return auth.response;

  return superAdminJson(
    auth,
    { error: "Super admin can view guardian links only. Branch admins manage links." },
    { status: 403 },
  );
}
