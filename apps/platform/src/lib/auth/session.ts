import type { AuthUser, TokenPair } from "@eduos/types";
import {
  clearAuthCookies,
  getAccessTokenFromRequest,
  getRefreshTokenFromRequest,
  setAuthCookies,
} from "@/lib/auth/cookies";
import * as authServer from "@/lib/services/platform-auth-server";

export type ResolvedSession = {
  user: AuthUser;
  tokens?: TokenPair;
};

/**
 * Coalesce AND briefly memoise refresh attempts. The refresh token is single-use
 * (each exchange invalidates the old one; presenting an already-used token is a
 * replay that revokes the whole family → logout everywhere). Coalescing only covers
 * *concurrent* callers; caching the result for a short window also covers sequential
 * presentations of the same token within a request/burst, so it's never exchanged
 * twice. Failures aren't cached; entries expire so real replays are still detected.
 */
const REFRESH_RESULT_TTL_MS = 30_000;
const REFRESH_CACHE_MAX = 500;
type RefreshEntry = { promise: Promise<TokenPair | null>; at: number };
const refreshCache = new Map<string, RefreshEntry>();

function pruneRefreshCache(): void {
  const now = Date.now();
  for (const [k, v] of refreshCache) {
    if (now - v.at >= REFRESH_RESULT_TTL_MS) refreshCache.delete(k);
  }
  if (refreshCache.size >= REFRESH_CACHE_MAX) {
    const oldest = refreshCache.keys().next().value;
    if (oldest !== undefined) refreshCache.delete(oldest);
  }
}

async function refreshTokensOnce(refreshToken: string): Promise<TokenPair | null> {
  const existing = refreshCache.get(refreshToken);
  if (existing && Date.now() - existing.at < REFRESH_RESULT_TTL_MS) {
    return existing.promise;
  }
  if (refreshCache.size >= REFRESH_CACHE_MAX) pruneRefreshCache();

  const promise = authServer
    .refreshTokens(refreshToken)
    .then((tokens) => {
      if (tokens === null) refreshCache.delete(refreshToken);
      return tokens;
    })
    .catch((err) => {
      refreshCache.delete(refreshToken);
      throw err;
    });
  refreshCache.set(refreshToken, { promise, at: Date.now() });
  return promise;
}

/** Coalesce parallel refresh attempts (token rotation revokes the old refresh token). */
export async function refreshOnce(refreshToken: string): Promise<TokenPair | null> {
  return refreshTokensOnce(refreshToken);
}

const ME_TTL_MS = 15_000;
const ME_CACHE_MAX = 500;
type MeCacheEntry = { user: AuthUser; at: number };
const meCache = new Map<string, MeCacheEntry>();
const meInflight = new Map<string, Promise<AuthUser | null>>();

export async function getMeCached(accessToken: string): Promise<AuthUser | null> {
  const key = `platform::${accessToken}`;
  const cached = meCache.get(key);
  if (cached && Date.now() - cached.at < ME_TTL_MS) {
    return cached.user;
  }
  const existing = meInflight.get(key);
  if (existing) return existing;

  const promise = authServer
    .getMe(accessToken)
    .then((user) => {
      if (user) {
        if (meCache.size >= ME_CACHE_MAX) pruneMeCache();
        meCache.set(key, { user, at: Date.now() });
      }
      return user;
    })
    .finally(() => {
      meInflight.delete(key);
    });
  meInflight.set(key, promise);
  return promise;
}

function pruneMeCache(): void {
  const now = Date.now();
  for (const [k, v] of meCache) {
    if (now - v.at >= ME_TTL_MS) meCache.delete(k);
  }
  if (meCache.size >= ME_CACHE_MAX) {
    const oldest = meCache.keys().next().value;
    if (oldest !== undefined) meCache.delete(oldest);
  }
}

export async function resolveAuthSession(
  request: Request,
): Promise<ResolvedSession | null> {
  const accessToken = getAccessTokenFromRequest(request);

  if (accessToken) {
    const user = await getMeCached(accessToken);
    if (user) return { user };
  }

  const refreshToken = getRefreshTokenFromRequest(request);
  if (!refreshToken) return null;

  const tokens = await refreshOnce(refreshToken);
  if (!tokens) return null;

  const user = await getMeCached(tokens.accessToken);
  if (!user) return null;

  return { user, tokens };
}

export type ApplySessionCookiesOptions = {
  /** When false, a null session does not wipe cookies (avoids logout on transient errors). */
  clearOnNull?: boolean;
};

export function applySessionCookies(
  response: {
    cookies: {
      set: (name: string, value: string, options: object) => void;
      delete: (name: string) => void;
    };
  },
  session: ResolvedSession | null,
  options?: ApplySessionCookiesOptions,
): void {
  if (session?.tokens) setAuthCookies(response, session.tokens);
  if (!session && options?.clearOnNull !== false) {
    clearAuthCookies(response);
  }
}
