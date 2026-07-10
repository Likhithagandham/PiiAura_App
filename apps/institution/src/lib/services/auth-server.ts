/**
 * Auth service — single boundary for Django backend.
 * Route handlers call this module; they do not branch on NEXT_PUBLIC_USE_MOCK.
 */

import { isPhoneNumber, normalizeToE164, ROLE_LABELS } from "@eduos/constants";
import type {
  AuthUser,
  DisambiguationAccount,
  LinkedAccountOption,
  LoginResult,
  ResetRequestResult,
  Role,
  TenantLoginConfig,
  TokenPair,
} from "@eduos/types";
import { getApiBaseUrl } from "@/lib/config";

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

// ── Django response shapes ───────────────────────────────────────────────────

interface DjangoMePayload {
  id: string;
  full_name?: string;
  name?: string;
  role: string;
  phone?: string | null;
  email?: string | null;
  branch_id?: string | null;
  branch?: string;
  theme?: AuthUser["branchTheme"];
  custom_login_id?: string | null;
  linked_user_group_id?: string | null;
  institution_type?: string | null;
  tenant_subdomain?: string | null;
}

interface DjangoTokenPair {
  access: string;
  refresh: string;
  must_change_password?: boolean;
}

interface DjangoMFARequired {
  mfa_required: true;
  mfa_session_token: string;
  email_hint: string;
}

type DjangoLoginResponse = DjangoTokenPair | DjangoMFARequired;

function isMFARequired(data: DjangoLoginResponse): data is DjangoMFARequired {
  return (data as DjangoMFARequired).mfa_required === true;
}

interface DjangoTenantConfig extends TenantLoginConfig {
  tenant_id?: string;
}

export interface LoginDisambiguationState {
  tenant_id: string;
  identifier: string;
  roles: Record<string, string>;
}

function normalizeLoginIdentifier(identifier: string): string {
  const trimmed = identifier.trim();
  return isPhoneNumber(trimmed) ? normalizeToE164(trimmed) : trimmed;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function mapMeToAuthUser(meData: DjangoMePayload, subdomain: string): AuthUser {
  return {
    id: meData.id,
    name: meData.full_name ?? meData.name ?? "",
    role: meData.role as AuthUser["role"],
    phone: meData.phone ?? null,
    custom_login_id: meData.custom_login_id ?? null,
    branch: meData.branch_id ?? meData.branch ?? undefined,
    tenant_subdomain: meData.tenant_subdomain ?? subdomain,
    linked_user_group_id: meData.linked_user_group_id ?? null,
    institution_type: (meData.institution_type as AuthUser["institution_type"]) ?? undefined,
    branchTheme: meData.theme ?? null,
  };
}

async function djangoFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<{ ok: true; data: T } | { ok: false; status: number; message?: string }> {
  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
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

type LoginWithRoleResult =
  | { kind: "tokens"; tokens: TokenPair; user: AuthUser; mustChangePassword: boolean }
  | { kind: "mfa_required"; mfaSessionToken: string; emailHint: string };

async function djangoLoginWithRole(
  identifier: string,
  password: string,
  role: string,
  tenantId: string,
  subdomain: string,
): Promise<LoginWithRoleResult | null> {
  const loginResult = await djangoFetch<DjangoLoginResponse>("/api/v1/auth/login/", {
    method: "POST",
    body: JSON.stringify({
      identifier,
      password,
      role,
      tenant_id: tenantId,
    }),
  });

  if (!loginResult.ok) {
    return null;
  }

  // MFA gate — admin/super_admin must verify email OTP before getting tokens
  if (isMFARequired(loginResult.data)) {
    return {
      kind: "mfa_required",
      mfaSessionToken: loginResult.data.mfa_session_token,
      emailHint: loginResult.data.email_hint,
    };
  }

  const tokenPair = loginResult.data as DjangoTokenPair;

  const meResult = await djangoFetch<DjangoMePayload>("/api/v1/auth/me/", {
    headers: {
      Authorization: `Bearer ${tokenPair.access}`,
    },
  });

  if (!meResult.ok) {
    return null;
  }

  return {
    kind: "tokens",
    tokens: {
      accessToken: tokenPair.access,
      refreshToken: tokenPair.refresh,
    },
    user: mapMeToAuthUser(meResult.data, subdomain),
    mustChangePassword: tokenPair.must_change_password ?? false,
  };
}

async function djangoGetTenantConfig(
  subdomain: string,
): Promise<TenantLoginConfig & { tenant_id?: string }> {
  const result = await djangoFetch<DjangoTenantConfig>(
    `/api/v1/organizations/tenant-config/?subdomain=${encodeURIComponent(subdomain)}`,
  );

  if (!result.ok) {
    throw new Error(result.message ?? "Failed to resolve tenant configuration");
  }

  return result.data;
}

// ── Public API ─────────────────────────────────────────────────────────────────

export async function getTenantLoginConfig(
  subdomain: string,
): Promise<TenantLoginConfig> {
  const config = await djangoGetTenantConfig(subdomain);
  return config;
}

export async function login(credentials: {
  identifier: string;
  password: string;
  subdomain: string;
  deviceType?: "mobile" | "desktop" | "unknown";
  deviceLabel?: string;
}): Promise<LoginResult> {
  const { identifier, password, subdomain } = credentials;
  const normalizedIdentifier = normalizeLoginIdentifier(identifier);

  const tenantConfig = await djangoGetTenantConfig(subdomain);
  const tenantId = tenantConfig.tenant_id;
  if (!tenantId) {
    throw new Error("Tenant configuration missing tenant_id");
  }

  const isPhone = isPhoneNumber(normalizedIdentifier);
  const potentialRoles = isPhone
    ? (["super_admin", "admin", "parent"] as const)
    : (["faculty", "student"] as const);

  const results = (
    await Promise.all(
      potentialRoles.map((role) =>
        djangoLoginWithRole(
          normalizedIdentifier,
          password,
          role,
          tenantId,
          subdomain,
        ),
      ),
    )
  ).filter((r): r is NonNullable<typeof r> => r !== null);

  if (results.length === 0) {
    throw new AuthError("Invalid credentials");
  }

  // MFA: if the first (and only) match requires a second factor, surface it.
  if (results.length === 1 && results[0]!.kind === "mfa_required") {
    const mfa = results[0]!;
    return {
      type: "mfa_required",
      mfaSessionToken: mfa.mfaSessionToken,
      emailHint: mfa.emailHint,
    };
  }

  // Filter to token results only for disambiguation / success handling
  const tokenResults = results.filter(
    (r): r is Extract<LoginWithRoleResult, { kind: "tokens" }> => r.kind === "tokens",
  );

  if (tokenResults.length === 0) {
    throw new AuthError("Invalid credentials");
  }

  if (tokenResults.length === 1) {
    const match = tokenResults[0]!;
    return {
      type: match.mustChangePassword ? "force_change_password" : "success",
      tokens: match.tokens,
      user: match.user,
    };
  }

  const rolesMap: Record<string, string> = {};
  const accounts: DisambiguationAccount[] = tokenResults.map((r) => {
    rolesMap[r.user.id] = r.user.role;
    return {
      userId: r.user.id,
      role: r.user.role,
      name: ROLE_LABELS[r.user.role as Role] ?? r.user.role,
      subtitle: `${r.user.name} — Role: ${r.user.role}`,
    };
  });

  const stateToken = Buffer.from(
    JSON.stringify({
      tenant_id: tenantId,
      identifier: normalizedIdentifier,
      roles: rolesMap,
    } satisfies LoginDisambiguationState),
  ).toString("base64");

  return {
    type: "disambiguation",
    token: stateToken,
    accounts,
  };
}

export async function completeDisambiguation(params: {
  token: string;
  userId: string;
  password: string;
  subdomain: string;
}): Promise<{ tokens: TokenPair; user: AuthUser; mustChangePassword: boolean }> {
  const { token, userId, password, subdomain } = params;

  let state: LoginDisambiguationState;
  try {
    state = JSON.parse(
      Buffer.from(token, "base64").toString("utf-8"),
    ) as LoginDisambiguationState;
  } catch {
    throw new AuthError("Invalid token session");
  }

  const role = state.roles[userId];
  if (!role) {
    throw new AuthError("Invalid account selection");
  }

  const match = await djangoLoginWithRole(
    state.identifier,
    password,
    role,
    state.tenant_id,
    subdomain,
  );

  if (!match || match.kind !== "tokens") {
    throw new AuthError("Invalid credentials");
  }

  return { tokens: match.tokens, user: match.user, mustChangePassword: match.mustChangePassword };
}

export async function logout(params: {
  accessToken: string | null;
  refreshToken: string | null;
}): Promise<void> {
  const { accessToken, refreshToken } = params;

  if (!accessToken || !refreshToken) {
    return;
  }

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
    console.error("Error logging out from backend:", err);
  }
}

export async function getMe(
  accessToken: string,
  subdomain: string,
): Promise<AuthUser | null> {
  const result = await djangoFetch<DjangoMePayload>("/api/v1/auth/me/", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!result.ok) {
    return null;
  }

  return mapMeToAuthUser(result.data, subdomain);
}

export async function refreshTokens(refreshToken: string): Promise<TokenPair | null> {
  const result = await djangoFetch<DjangoTokenPair>("/api/v1/auth/refresh/", {
    method: "POST",
    body: JSON.stringify({ refresh: refreshToken }),
  });

  if (!result.ok) {
    return null;
  }

  return {
    accessToken: result.data.access,
    refreshToken: result.data.refresh,
  };
}

export async function listLinkedAccounts(
  accessToken: string,
): Promise<LinkedAccountOption[]> {
  const result = await djangoFetch<LinkedAccountOption[]>("/api/v1/auth/linked-accounts/", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!result.ok) {
    return [];
  }

  return result.data;
}

export async function switchLinkedAccount(params: {
  accessToken: string;
  targetUserId: string;
  password: string;
}): Promise<{ tokens: TokenPair; user: AuthUser }> {
  const { accessToken, targetUserId, password } = params;

  const result = await djangoFetch<{ user: AuthUser; access: string; refresh: string }>(
    "/api/v1/auth/switch-linked/",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ target_user_id: targetUserId, password }),
    },
  );

  if (!result.ok) {
    throw new AuthError(result.message ?? "Could not switch account");
  }

  return {
    tokens: {
      accessToken: result.data.access,
      refreshToken: result.data.refresh,
    },
    user: result.data.user,
  };
}

// ── Password reset (OTP) ─────────────────────────────────────────────────────
//
// The frontend flow is request → select → verify-otp → confirm. Django exposes
// check-otp (verify only) and verify (OTP + new password).

interface DjangoResetAccount {
  user_id: string;
  role: string;
  name: string;
}

interface ResetState {
  phone: string;
  tenantId: string;
  subdomain: string;
}
interface ConfirmState extends ResetState {
  otp: string;
}

function encodeState(payload: object): string {
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}
function decodeState<T>(token: string): T {
  try {
    return JSON.parse(Buffer.from(token, "base64").toString("utf-8")) as T;
  } catch {
    throw new AuthError("Session expired. Please start over.");
  }
}

export async function requestPasswordReset(
  phone: string,
  subdomain: string,
): Promise<ResetRequestResult> {
  const normalized = normalizeLoginIdentifier(phone);
  const tenant = await djangoGetTenantConfig(subdomain);
  const tenantId = tenant.tenant_id;
  if (!tenantId) throw new AuthError("Tenant configuration missing tenant_id");

  const accountsResult = await djangoFetch<{ accounts: DjangoResetAccount[] }>(
    "/api/v1/auth/password/reset/accounts/",
    { method: "POST", body: JSON.stringify({ phone: normalized, tenant_id: tenantId }) },
  );
  const accounts = accountsResult.ok ? accountsResult.data.accounts : [];

  // Always hit the backend request endpoint so dev OTP logging runs (same UX either way).
  const requestOtp = (accountId?: string) =>
    djangoFetch("/api/v1/auth/password/reset/request/", {
      method: "POST",
      body: JSON.stringify({
        phone: normalized,
        tenant_id: tenantId,
        ...(accountId ? { account_id: accountId } : {}),
      }),
    });

  if (accounts.length === 0) {
    await requestOtp();
    return { type: "generic_sent" };
  }

  if (accounts.length === 1) {
    await requestOtp(accounts[0]!.user_id);
    if (process.env.NODE_ENV === "development") {
      console.log(
        `\n[DEV OTP] Sent via Django for ${normalized} — check the Django server terminal for the code.\n`,
      );
    }
    return {
      type: "otp_sent",
      otpToken: encodeState({ phone: normalized, tenantId, subdomain } satisfies ResetState),
    };
  }

  return {
    type: "disambiguation",
    selectionToken: encodeState({ phone: normalized, tenantId, subdomain } satisfies ResetState),
    accounts: accounts.map((a) => ({
      userId: a.user_id,
      role: a.role as DisambiguationAccount["role"],
      name: ROLE_LABELS[a.role as Role] ?? a.role,
      subtitle: `${a.name} — Role: ${a.role}`,
    })),
  };
}

export async function selectAccountForReset(
  selectionToken: string,
  userId: string,
): Promise<{ otpToken: string }> {
  const state = decodeState<ResetState>(selectionToken);
  await djangoFetch("/api/v1/auth/password/reset/request/", {
    method: "POST",
    body: JSON.stringify({
      phone: state.phone,
      tenant_id: state.tenantId,
      account_id: userId,
    }),
  });
  if (process.env.NODE_ENV === "development") {
    console.log(
      `\n[DEV OTP] Sent via Django for ${state.phone} — check the Django server terminal for the code.\n`,
    );
  }
  return { otpToken: encodeState(state) };
}

export async function verifyOtp(
  otpToken: string,
  otpCode: string,
): Promise<{ resetToken: string }> {
  const state = decodeState<ResetState>(otpToken);
  const result = await djangoFetch("/api/v1/auth/password/reset/check-otp/", {
    method: "POST",
    body: JSON.stringify({
      phone: state.phone,
      tenant_id: state.tenantId,
      otp: otpCode,
    }),
  });
  if (!result.ok) {
    throw new AuthError(result.message ?? "Incorrect OTP.");
  }
  return { resetToken: encodeState({ ...state, otp: otpCode } satisfies ConfirmState) };
}

export async function resendOtp(otpToken: string): Promise<void> {
  const state = decodeState<ResetState>(otpToken);
  await djangoFetch("/api/v1/auth/password/reset/request/", {
    method: "POST",
    body: JSON.stringify({ phone: state.phone, tenant_id: state.tenantId }),
  });
}

export async function confirmPasswordReset(
  resetToken: string,
  newPassword: string,
): Promise<void> {
  const state = decodeState<ConfirmState>(resetToken);
  const result = await djangoFetch("/api/v1/auth/password/reset/verify/", {
    method: "POST",
    body: JSON.stringify({
      phone: state.phone,
      tenant_id: state.tenantId,
      otp: state.otp,
      new_password: newPassword,
      confirm_password: newPassword,
    }),
  });
  if (!result.ok) {
    throw new AuthError(result.message ?? "Password reset failed. Please start over.");
  }
}

export async function verifyMfaOtp(params: {
  mfaSessionToken: string;
  otp: string;
  subdomain: string;
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
    throw new AuthError("Failed to load user profile after MFA verification.");
  }

  return {
    tokens: { accessToken: tokenPair.access, refreshToken: tokenPair.refresh },
    user: mapMeToAuthUser(meResult.data, params.subdomain),
  };
}

// ── Invite accept ────────────────────────────────────────────────────────────

interface DjangoInviteAccepted {
  access: string;
  refresh: string;
  user_id: string;
  role: string;
}

// ── Force change password ─────────────────────────────────────────────────────

export async function forceChangePassword(params: {
  accessToken: string;
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  const result = await djangoFetch("/api/v1/auth/password/change/", {
    method: "POST",
    headers: { Authorization: `Bearer ${params.accessToken}` },
    body: JSON.stringify({
      current_password: params.currentPassword,
      new_password: params.newPassword,
      confirm_password: params.newPassword,
    }),
  });
  if (!result.ok) {
    throw new AuthError((result as { ok: false; message?: string }).message ?? "Password change failed.");
  }
}

// ── Session management ────────────────────────────────────────────────────────

export interface ActiveSession {
  id: string;
  device_info: string;
  ip_address: string | null;
  created_at: string;
  expires_at: string;
}

export async function listSessions(accessToken: string): Promise<ActiveSession[]> {
  const result = await djangoFetch<{ sessions: ActiveSession[] }>("/api/v1/auth/sessions/", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!result.ok) return [];
  return result.data.sessions;
}

export async function revokeSession(accessToken: string, sessionId: string): Promise<void> {
  const result = await djangoFetch(`/api/v1/auth/sessions/${sessionId}/`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!result.ok) {
    throw new AuthError((result as { ok: false; message?: string }).message ?? "Failed to revoke session.");
  }
}

// ── Identity changes ──────────────────────────────────────────────────────────

export async function initiatePhoneChange(accessToken: string, newPhone: string): Promise<void> {
  const result = await djangoFetch("/api/v1/auth/change-phone/initiate/", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ new_phone: newPhone }),
  });
  if (!result.ok) {
    throw new AuthError((result as { ok: false; message?: string }).message ?? "Failed to initiate phone change.");
  }
}

export async function confirmPhoneChange(accessToken: string, otp: string): Promise<void> {
  const result = await djangoFetch("/api/v1/auth/change-phone/confirm/", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ otp }),
  });
  if (!result.ok) {
    throw new AuthError((result as { ok: false; message?: string }).message ?? "Incorrect verification code.");
  }
}

export async function initiateEmailChange(accessToken: string, newEmail: string): Promise<void> {
  const result = await djangoFetch("/api/v1/auth/change-email/initiate/", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ new_email: newEmail }),
  });
  if (!result.ok) {
    throw new AuthError((result as { ok: false; message?: string }).message ?? "Failed to initiate email change.");
  }
}

export async function confirmEmailChange(accessToken: string, otp: string): Promise<void> {
  const result = await djangoFetch("/api/v1/auth/change-email/confirm/", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ otp }),
  });
  if (!result.ok) {
    throw new AuthError((result as { ok: false; message?: string }).message ?? "Incorrect verification code.");
  }
}

export async function logoutAll(accessToken: string): Promise<void> {
  const result = await djangoFetch("/api/v1/auth/logout/all/", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!result.ok) {
    throw new AuthError((result as { ok: false; message?: string }).message ?? "Failed to sign out from all devices.");
  }
}

// ── Invite accept ────────────────────────────────────────────────────────────

export async function acceptInvite(params: {
  token: string;
  newPassword: string;
  subdomain: string;
}): Promise<{ tokens: TokenPair; user: AuthUser }> {
  const acceptResult = await djangoFetch<DjangoInviteAccepted>("/api/v1/auth/invite/accept/", {
    method: "POST",
    body: JSON.stringify({
      token: params.token,
      new_password: params.newPassword,
      confirm_password: params.newPassword,
    }),
  });
  if (!acceptResult.ok) {
    throw new AuthError(acceptResult.message ?? "Failed to accept invite. The link may have expired.");
  }
  const tokenPair = acceptResult.data;

  const meResult = await djangoFetch<DjangoMePayload>("/api/v1/auth/me/", {
    headers: { Authorization: `Bearer ${tokenPair.access}` },
  });
  if (!meResult.ok) {
    throw new AuthError("Account activated but failed to load profile. Please log in.");
  }

  return {
    tokens: { accessToken: tokenPair.access, refreshToken: tokenPair.refresh },
    user: mapMeToAuthUser(meResult.data, params.subdomain),
  };
}
