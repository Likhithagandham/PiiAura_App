/**
 * Server-side session resolution: access token → refresh → logout.
 */

import type { AuthUser, TokenPair } from "@eduos/types";
import {
  clearAuthCookies,
  getAccessTokenFromRequest,
  getRefreshTokenFromRequest,
  setAuthCookies,
  setRequestAccessToken,
} from "@/lib/auth/cookies";
import { getTenantSubdomainFromRequest } from "@/lib/tenant";
import * as authServer from "@/lib/services/auth-server";

export type ResolvedSession = {
  user: AuthUser;
  /** Set when tokens were rotated and cookies must be updated on the response */
  tokens?: TokenPair;
};

/**
 * Coalesce + briefly memoise refresh calls so a single-use refresh token is only
 * ever exchanged ONCE, even across sequential presentations within a request.
 *
 * The backend uses single-use rotating refresh tokens with family replay detection:
 * exchanging a refresh token revokes it, and presenting an already-revoked token is
 * treated as a replay attack that revokes the WHOLE family (logout everywhere). So
 * two exchanges of the same token — e.g. the auth check refreshes, then a data call
 * in the same request 401s on the stale access cookie and refreshes again — would
 * nuke the session. Coalescing only helped *concurrent* callers; we now also cache
 * the RESULT keyed by the presented refresh token for a short window, so any later
 * caller with that same token gets the same new pair instead of a second exchange.
 *
 * Failures are not cached (a genuinely-expired token must be retryable), and entries
 * expire quickly so real replay attacks are still detected outside the window.
 *
 * Shared with the BFF data client (`django-client.ts`) via export.
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

export async function refreshOnce(refreshToken: string): Promise<TokenPair | null> {
  const existing = refreshCache.get(refreshToken);
  if (existing && Date.now() - existing.at < REFRESH_RESULT_TTL_MS) {
    return existing.promise;
  }
  if (refreshCache.size >= REFRESH_CACHE_MAX) pruneRefreshCache();

  const promise = authServer
    .refreshTokens(refreshToken)
    .then((tokens) => {
      // Don't cache a failed exchange — a later legitimate retry must be allowed.
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

/**
 * getMe cache + in-flight coalescing.
 *
 * `getMe` is a Django round-trip that ran on EVERY authenticated BFF request
 * (via `resolveAuthSession`). A single page fires several `/api/*` calls at
 * once, so each one paid a redundant `/auth/me/` round-trip on top of its data
 * fetch. We now:
 *  - coalesce concurrent calls for the same token into one request, and
 *  - cache the resolved user for a short TTL so a page's burst of calls and
 *    quick back-to-back navigations reuse it.
 *
 * The cache key includes the access token, which rotates every ~15 min, so a
 * revoked/rotated token can never hit a stale entry beyond `ME_TTL_MS`.
 */
const ME_TTL_MS = 15_000;
const ME_CACHE_MAX = 500;
type MeCacheEntry = { user: AuthUser; at: number };
const meCache = new Map<string, MeCacheEntry>();
const meInflight = new Map<string, Promise<AuthUser | null>>();

export async function getMeCached(accessToken: string, subdomain: string): Promise<AuthUser | null> {
  const key = `${subdomain}::${accessToken}`;
  const cached = meCache.get(key);
  if (cached && Date.now() - cached.at < ME_TTL_MS) {
    return cached.user;
  }
  const existing = meInflight.get(key);
  if (existing) return existing;

  const promise = authServer
    .getMe(accessToken, subdomain)
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
  // If everything was still fresh (unlikely), drop the oldest to bound memory.
  if (meCache.size >= ME_CACHE_MAX) {
    const oldest = meCache.keys().next().value;
    if (oldest !== undefined) meCache.delete(oldest);
  }
}

/**
 * Resolve the current user from cookies.
 * 1. Try access token → GET /me
 * 2. On failure, try refresh token → POST /refresh → GET /me
 * 3. Return null if both fail (caller should clear cookies / logout)
 */
export async function resolveAuthSession(
  request: Request,
): Promise<ResolvedSession | null> {
  const subdomain = getTenantSubdomainFromRequest(request);
  const accessToken = getAccessTokenFromRequest(request);

  if (accessToken) {
    const user = await getMeCached(accessToken, subdomain);
    if (user) {
      return { user };
    }
  }

  const refreshToken = getRefreshTokenFromRequest(request);
  if (!refreshToken) {
    return null;
  }

  const tokens = await refreshOnce(refreshToken);
  if (!tokens) {
    return null;
  }

  // Thread the fresh access token through the rest of THIS request so downstream
  // Django calls don't re-read the stale request cookie, 401, and refresh again.
  setRequestAccessToken(request, tokens.accessToken);

  const user = await getMeCached(tokens.accessToken, subdomain);
  if (!user) {
    return null;
  }

  return { user, tokens };
}

export function applySessionCookies(
  response: {
    cookies: {
      set: (name: string, value: string, options: object) => void;
      delete: (name: string) => void;
    };
  },
  session: ResolvedSession | null,
): void {
  if (session?.tokens) {
    setAuthCookies(response, session.tokens, session.user?.institution_type);
  }
  if (!session) {
    clearAuthCookies(response);
  }
}
