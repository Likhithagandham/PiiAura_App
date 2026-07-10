import { NextResponse } from "next/server";
import type { AuthUser, TokenPair } from "@eduos/types";
import { getAccessTokenFromRequest, setAuthCookies } from "@/lib/auth/cookies";
import { requireRole } from "@/lib/auth/require-role";
import { getMaintenanceMode } from "@/lib/services/platform-owner-server";

export type PlatformOwnerAuthOk = {
  user: AuthUser;
  accessToken: string;
  sessionTokens?: TokenPair;
};

export type PlatformOwnerAuthResult =
  | ({ ok: true } & PlatformOwnerAuthOk)
  | { ok: false; response: NextResponse };

export async function requirePlatformOwner(
  request: Request,
): Promise<PlatformOwnerAuthResult> {
  const auth = await requireRole(request, "platform_owner");
  if ("error" in auth) {
    return {
      ok: false,
      response: NextResponse.json({ error: auth.error }, { status: auth.status }),
    };
  }
  const accessToken =
    auth.tokens?.accessToken ?? getAccessTokenFromRequest(request) ?? "";
  return { ok: true, user: auth.user, accessToken, sessionTokens: auth.tokens };
}

const READ_METHODS = new Set(["GET", "HEAD"]);

/** F-019 — block mutating platform-owner APIs when maintenance blockWrites is on */
export async function requirePlatformOwnerWrite(
  request: Request,
): Promise<PlatformOwnerAuthResult> {
  const auth = await requirePlatformOwner(request);
  if (!auth.ok) return auth;

  if (!READ_METHODS.has(request.method.toUpperCase())) {
    try {
      const maintenance = await getMaintenanceMode(auth.accessToken);
      if (maintenance.enabled && maintenance.blockWrites) {
        return {
          ok: false,
          response: NextResponse.json(
            {
              error: maintenance.message,
              maintenanceBlocked: true,
              scheduledEndAt: maintenance.scheduledEndAt,
            },
            { status: 503 },
          ),
        };
      }
    } catch {
      // If maintenance check fails, allow the request through rather than blocking writes.
    }
  }

  return auth;
}

export function platformOwnerJson(
  auth: PlatformOwnerAuthOk,
  data: unknown,
  init?: ResponseInit,
): NextResponse {
  const response = NextResponse.json(data, init);
  if (auth.sessionTokens) setAuthCookies(response, auth.sessionTokens);
  return response;
}

/** Map backend throws (incl. DRF throttle) to a safe BFF status without crashing the route. */
export function platformOwnerErrorJson(
  auth: PlatformOwnerAuthOk,
  err: unknown,
  fallback: string,
): NextResponse {
  const message = err instanceof Error ? err.message : fallback;
  const status = /throttl/i.test(message) ? 429 : 500;
  return platformOwnerJson(auth, { error: message }, { status });
}
