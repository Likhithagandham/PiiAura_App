import { PLATFORM_AUTH_COOKIE_NAMES } from "@eduos/constants";
import type { TokenPair } from "@eduos/types";

const AUTH_COOKIE_NAMES = PLATFORM_AUTH_COOKIE_NAMES;
const isProd = process.env.NODE_ENV === "production";

export function setAuthCookies(
  response: { cookies: { set: (name: string, value: string, options: object) => void } },
  tokens: TokenPair,
): void {
  const base = {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
  };

  response.cookies.set(AUTH_COOKIE_NAMES.accessToken, tokens.accessToken, {
    ...base,
    maxAge: 900, // 15 min — matches JWT ACCESS_TOKEN_LIFETIME
  });
  response.cookies.set(AUTH_COOKIE_NAMES.refreshToken, tokens.refreshToken, {
    ...base,
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearAuthCookies(
  response: { cookies: { delete: (name: string) => void } },
): void {
  response.cookies.delete(AUTH_COOKIE_NAMES.accessToken);
  response.cookies.delete(AUTH_COOKIE_NAMES.refreshToken);
}

function readCookie(request: Request, name: string): string | null {
  const cookie = request.headers.get("cookie") ?? "";
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = cookie.match(new RegExp(`${escaped}=([^;]+)`));
  if (!match?.[1]) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

export function getAccessTokenFromRequest(request: Request): string | null {
  return readCookie(request, AUTH_COOKIE_NAMES.accessToken);
}

export function getRefreshTokenFromRequest(request: Request): string | null {
  return readCookie(request, AUTH_COOKIE_NAMES.refreshToken);
}
