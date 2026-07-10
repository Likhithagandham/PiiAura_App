import { NextResponse } from "next/server";
import type { TokenPair } from "@eduos/types";
import { getAccessTokenFromRequest, setAuthCookies } from "@/lib/auth/cookies";
import { requireRole } from "@/lib/auth/require-role";
import { getTenantSubdomainFromRequest } from "@/lib/tenant";
import { djangoGet } from "@/lib/services/django-client";

export type ParentAuthOk = {
  subdomain: string;
  parentUserId: string;
  parentName: string;
  accessToken: string;
  sessionTokens?: TokenPair;
};

export type ParentAuthResult =
  | ({ ok: true } & ParentAuthOk)
  | { ok: false; response: NextResponse };

export async function requireParent(request: Request): Promise<ParentAuthResult> {
  const auth = await requireRole(request, "parent");
  if ("error" in auth) {
    return {
      ok: false,
      response: NextResponse.json({ error: auth.error }, { status: auth.status }),
    };
  }

  const subdomain = getTenantSubdomainFromRequest(request);

  let access: { allowed: boolean; reason?: string };
  try {
    access = await djangoGet<{ allowed: boolean; reason?: string }>(
      request,
      "/api/v1/parent/portal-access/",
    );
  } catch {
    access = { allowed: false, reason: "Parent portal unavailable" };
  }

  if (!access.allowed) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: access.reason ?? "Parent portal unavailable", code: "parent_portal_disabled" },
        { status: 403 },
      ),
    };
  }

  const accessToken = auth.tokens?.accessToken ?? getAccessTokenFromRequest(request);
  if (!accessToken) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return {
    ok: true,
    subdomain,
    parentUserId: auth.user.id,
    parentName: auth.user.name,
    accessToken,
    sessionTokens: auth.tokens,
  };
}

export function applyParentSessionCookies(response: NextResponse, auth: ParentAuthOk): NextResponse {
  if (auth.sessionTokens) {
    setAuthCookies(response, auth.sessionTokens);
  }
  return response;
}

export function parentJson(auth: ParentAuthOk, data: unknown, init?: ResponseInit): NextResponse {
  return applyParentSessionCookies(NextResponse.json(data, init), auth);
}

export function requireChildId(request: Request): string | null {
  return new URL(request.url).searchParams.get("childId");
}
