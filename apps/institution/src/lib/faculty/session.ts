import { AUTH_COOKIE_NAMES } from "@eduos/constants";
import type { AuthUser } from "@eduos/types";
import { cookies } from "next/headers";
import { getMe } from "@/lib/services/auth-server";

const DEFAULT_TENANT = process.env.NEXT_PUBLIC_DEFAULT_TENANT?.trim() ?? "";

export async function getFacultySession(): Promise<
  | { ok: true; user: AuthUser; subdomain: string }
  | { ok: false; error: string }
> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAMES.accessToken)?.value;
  if (!token) return { ok: false, error: "Unauthorized" };

  try {
    const user = await getMe(token, DEFAULT_TENANT);
    if (!user) return { ok: false, error: "Unauthorized" };
    if (user.role !== "faculty") return { ok: false, error: "Forbidden" };
    return { ok: true, user, subdomain: user.tenant_subdomain ?? DEFAULT_TENANT };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unauthorized";
    return { ok: false, error: msg };
  }
}
