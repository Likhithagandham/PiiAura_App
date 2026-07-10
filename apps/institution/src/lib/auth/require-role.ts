import type { AuthUser, Role, TokenPair } from "@eduos/types";
import { resolveAuthSession } from "./session";

export type RoleAuthResult =
  | { user: AuthUser; tokens?: TokenPair }
  | { error: string; status: 401 | 403 };

export async function requireRole(request: Request, role: Role): Promise<RoleAuthResult> {
  const session = await resolveAuthSession(request);
  if (!session) {
    return { error: "Unauthorized", status: 401 };
  }
  if (session.user.role !== role) {
    return { error: "Forbidden", status: 403 };
  }
  return { user: session.user, tokens: session.tokens };
}
