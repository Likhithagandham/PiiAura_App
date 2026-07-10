/**
 * Platform-owner auth — single boundary for Django backend.
 * Platform owners are tenant-less and log in via /api/v1/auth/platform/login/.
 * Session (me / refresh / logout) reuses the standard token endpoints.
 */

import type { AuthUser, LoginResult, TokenPair } from "@eduos/types";
import { getApiBaseUrl } from "@/lib/config";

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

interface DjangoMePayload {
  id: string;
  full_name?: string;
  name?: string;
  role: string;
  phone?: string | null;
  email?: string | null;
  branch_id?: string | null;
}

interface DjangoTokenPair {
  access: string;
  refresh: string;
}

interface DjangoMFARequired {
  mfa_required: true;
  mfa_session_token: string;
  email_hint: string;
}

type DjangoLoginResponse = DjangoTokenPair | DjangoMFARequired;

async function djangoFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<{ ok: true; data: T } | { ok: false; status: number; message?: string }> {
  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message =
      typeof body === "object" && body && "message" in body
        ? String((body as { message: string }).message)
        : undefined;
    return { ok: false, status: res.status, message };
  }
  const envelope = await res.json();
  return { ok: true, data: envelope.data as T };
}

function mapMeToAuthUser(me: DjangoMePayload): AuthUser {
  return {
    id: me.id,
    name: me.full_name ?? me.name ?? "",
    role: me.role as AuthUser["role"],
    phone: me.phone ?? null,
    custom_login_id: null,
    branch: me.branch_id ?? undefined,
    // Platform owners are not tenant-scoped; a sentinel keeps the AuthUser shape valid.
    tenant_subdomain: "platform",
  };
}

export async function login(credentials: {
  identifier: string;
  password: string;
  deviceType?: "mobile" | "desktop" | "unknown";
  deviceLabel?: string;
}): Promise<LoginResult> {
  const loginResult = await djangoFetch<DjangoLoginResponse>("/api/v1/auth/platform/login/", {
    method: "POST",
    body: JSON.stringify({
      identifier: credentials.identifier,
      password: credentials.password,
    }),
  });
  if (!loginResult.ok) {
    throw new AuthError(loginResult.message ?? "Invalid credentials");
  }

  // MFA gate for platform owners
  const loginData = loginResult.data;
  if ((loginData as DjangoMFARequired).mfa_required) {
    const mfa = loginData as DjangoMFARequired;
    return {
      type: "mfa_required",
      mfaSessionToken: mfa.mfa_session_token,
      emailHint: mfa.email_hint,
    };
  }

  const tokenPair = loginData as DjangoTokenPair;
  const meResult = await djangoFetch<DjangoMePayload>("/api/v1/auth/me/", {
    headers: { Authorization: `Bearer ${tokenPair.access}` },
  });
  if (!meResult.ok) {
    throw new AuthError("Could not load platform profile");
  }

  return {
    type: "success",
    tokens: {
      accessToken: tokenPair.access,
      refreshToken: tokenPair.refresh,
    },
    user: mapMeToAuthUser(meResult.data),
  };
}

export async function logout(
  accessToken: string | null,
  refreshToken: string | null,
): Promise<void> {
  if (!accessToken || !refreshToken) return;
  try {
    await fetch(`${getApiBaseUrl()}/api/v1/auth/logout/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });
  } catch (err) {
    console.error("[platform logout] backend call failed:", err);
  }
}

export async function verifyMfaOtp(params: {
  mfaSessionToken: string;
  otp: string;
}): Promise<{ tokens: TokenPair; user: AuthUser }> {
  const verifyResult = await djangoFetch<DjangoTokenPair>("/api/v1/auth/mfa/verify/", {
    method: "POST",
    body: JSON.stringify({
      mfa_session_token: params.mfaSessionToken,
      otp: params.otp,
    }),
  });
  if (!verifyResult.ok) {
    throw new AuthError(verifyResult.message ?? "Invalid verification code.");
  }
  const tokenPair = verifyResult.data;

  const meResult = await djangoFetch<DjangoMePayload>("/api/v1/auth/me/", {
    headers: { Authorization: `Bearer ${tokenPair.access}` },
  });
  if (!meResult.ok) {
    throw new AuthError("Failed to load platform profile after MFA.");
  }

  return {
    tokens: { accessToken: tokenPair.access, refreshToken: tokenPair.refresh },
    user: mapMeToAuthUser(meResult.data),
  };
}

export async function getMe(accessToken: string): Promise<AuthUser | null> {
  const result = await djangoFetch<DjangoMePayload>("/api/v1/auth/me/", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!result.ok) return null;
  const user = mapMeToAuthUser(result.data);
  // Guard: only platform owners may use the platform app.
  return user.role === "platform_owner" ? user : null;
}

export async function refreshTokens(refreshToken: string): Promise<TokenPair | null> {
  const result = await djangoFetch<DjangoTokenPair>("/api/v1/auth/refresh/", {
    method: "POST",
    body: JSON.stringify({ refresh: refreshToken }),
  });
  if (!result.ok) return null;
  return { accessToken: result.data.access, refreshToken: result.data.refresh };
}
