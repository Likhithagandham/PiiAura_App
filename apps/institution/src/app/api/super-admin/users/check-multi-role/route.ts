import type { CreateUserInput } from "@eduos/types";
import { requireSuperAdmin, superAdminJson } from "@/lib/super-admin/api";
import { checkMultiRole } from "@/lib/services/users.service";
import { mapSuperAdminError } from "../../errors";

export async function POST(request: Request) {
  const auth = await requireSuperAdmin(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json()) as CreateUserInput;
  try {
    const warning = await checkMultiRole(request, auth.subdomain, body);
    return superAdminJson(auth, { warning });
  } catch (err) {
    const { message, status } = mapSuperAdminError(err);
    return superAdminJson(auth, { error: message }, { status });
  }
}
