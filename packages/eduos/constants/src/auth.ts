import type { LoginIdentifierType, Role } from "@eduos/types";

/** Product-level constant — NOT per-institution */
export const LOGIN_IDENTIFIER_BY_ROLE: Record<Role, LoginIdentifierType> = {
  platform_owner: "phone",
  super_admin: "phone",
  admin: "phone",
  faculty: "custom_id",
  student: "custom_id",
  parent: "phone",
};

export const PHONE_LOGIN_ROLES: Role[] = ["admin", "super_admin", "parent"];

export const CUSTOM_ID_LOGIN_ROLES: Role[] = ["faculty", "student"];

export const ROLE_LABELS: Record<Role, string> = {
  platform_owner: "Platform Owner",
  super_admin: "Super Admin",
  admin: "Admin",
  faculty: "Faculty",
  student: "Student",
  parent: "Parent",
};

export const DASHBOARD_PATH_BY_ROLE: Record<Role, string> = {
  platform_owner: "/dashboard",
  super_admin: "/super-admin/dashboard",
  admin: "/admin/dashboard",
  faculty: "/faculty/dashboard",
  student: "/student/dashboard",
  parent: "/parent/dashboard",
};

/** F-221 — access cookie max-age (seconds) */
export const ACCESS_TOKEN_MAX_AGE_SEC = 15 * 60;

/** F-221 — refresh cookie max-age (seconds) */
export const REFRESH_TOKEN_MAX_AGE_SEC = 7 * 24 * 60 * 60;

/** F-227 — password reset link/token TTL */
export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

/** F-223 — multi-tab logout sync */
export const AUTH_BROADCAST_CHANNEL = "eduos-auth";

/** F-224 — API error code when server-side role no longer matches session */
export const AUTH_ERROR_ROLE_CHANGED = "role_changed";

/** F-229 — role → allowed route prefixes (institution app) */
export const ROLE_ROUTE_PREFIXES: Record<Role, string[]> = {
  platform_owner: [],
  super_admin: ["/super-admin"],
  admin: ["/admin"],
  faculty: ["/faculty"],
  student: ["/student"],
  parent: ["/parent"],
};

export const AUTH_COOKIE_NAMES = {
  accessToken: "eduos_access_token",
  refreshToken: "eduos_refresh_token",
  /** F-229 — non-secret role hint for middleware routing only (not for API authz) */
  roleHint: "eduos_role_hint",
  /** F-254 — non-secret institution type for client feature flags (not for API authz) */
  institutionType: "eduos_institution_type",
} as const;

/** Separate from institution cookies so localhost:3000 and :3001 do not share sessions */
export const PLATFORM_AUTH_COOKIE_NAMES = {
  accessToken: "eduos_platform_access_token",
  refreshToken: "eduos_platform_refresh_token",
} as const;

export const MOCK_OTP = "123456";

export const OTP_RESEND_COOLDOWN_SEC = 60;
export const OTP_MAX_RESENDS = 3;
export const OTP_TTL_MIN = 5;
