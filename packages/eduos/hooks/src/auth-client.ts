import {
  AUTH_BROADCAST_CHANNEL,
  AUTH_ERROR_ROLE_CHANGED,
} from "@eduos/constants";

/* ---------- F-223 multi-tab auth sync ---------- */

export type AuthBroadcastMessage =
  | { type: "logout" }
  | { type: "session_refresh" };

function postAuthBroadcast(message: AuthBroadcastMessage): void {
  if (typeof window === "undefined") return;
  try {
    const channel = new BroadcastChannel(AUTH_BROADCAST_CHANNEL);
    channel.postMessage(message);
    channel.close();
  } catch {
    /* BroadcastChannel unsupported */
  }
}

export function broadcastAuthLogout(): void {
  postAuthBroadcast({ type: "logout" });
}

export function broadcastAuthSessionRefresh(): void {
  postAuthBroadcast({ type: "session_refresh" });
}

export function subscribeAuthBroadcast(
  handler: (message: AuthBroadcastMessage) => void,
): () => void {
  if (typeof window === "undefined") return () => undefined;

  try {
    const channel = new BroadcastChannel(AUTH_BROADCAST_CHANNEL);
    channel.onmessage = (event: MessageEvent<AuthBroadcastMessage>) => {
      const msg = event.data;
      if (msg?.type === "logout" || msg?.type === "session_refresh") {
        handler(msg);
      }
    };
    return () => channel.close();
  } catch {
    return () => undefined;
  }
}

/* ---------- F-222 silent refresh on 401 ---------- */

type FetchInput = Parameters<typeof fetch>[0];
type FetchInit = Parameters<typeof fetch>[1];

const NATIVE_FETCH_KEY = "__eduos_native_fetch__";

export function nativeAuthFetch(): typeof fetch {
  const g = globalThis as typeof globalThis & { [NATIVE_FETCH_KEY]?: typeof fetch };
  if (g[NATIVE_FETCH_KEY]) return g[NATIVE_FETCH_KEY];

  const native = globalThis.fetch.bind(globalThis);
  g[NATIVE_FETCH_KEY] = native;
  return native;
}

if (typeof globalThis.fetch === "function") {
  nativeAuthFetch();
}

let refreshPromise: Promise<boolean> | null = null;
let onForceLogout: (() => void) | null = null;

export function setAuthFetchHandlers(handlers: { onForceLogout: () => void }): void {
  onForceLogout = handlers.onForceLogout;
}

async function refreshSession(): Promise<boolean> {
  const res = await nativeAuthFetch()("/api/auth/refresh", {
    method: "POST",
    credentials: "include",
  });
  return res.ok;
}

function isApiRequest(input: FetchInput): boolean {
  if (typeof input === "string") {
    return input.startsWith("/api/") && !input.startsWith("/api/auth/refresh");
  }
  if (input instanceof URL) {
    return input.pathname.startsWith("/api/") && !input.pathname.startsWith("/api/auth/refresh");
  }
  if (input instanceof Request) {
    const path = new URL(input.url).pathname;
    return path.startsWith("/api/") && !path.startsWith("/api/auth/refresh");
  }
  return false;
}

export async function authFetch(input: FetchInput, init?: FetchInit): Promise<Response> {
  const doFetch = nativeAuthFetch();
  const merged: FetchInit = { ...init, credentials: init?.credentials ?? "include" };
  let res = await doFetch(input, merged);

  if (!isApiRequest(input) || res.status !== 401) {
    return res;
  }

  const clone = res.clone();
  let code: string | undefined;
  try {
    const json = (await clone.json()) as {
      code?: string;
      error?: string | { code?: string };
    };
    if (typeof json.error === "object" && json.error?.code) code = json.error.code;
    else if (json.code) code = json.code;
  } catch {
    /* ignore */
  }

  if (code === AUTH_ERROR_ROLE_CHANGED) {
    onForceLogout?.();
    return res;
  }

  if (!refreshPromise) {
    refreshPromise = refreshSession().finally(() => {
      refreshPromise = null;
    });
  }
  const refreshed = await refreshPromise;
  if (!refreshed) {
    onForceLogout?.();
    return res;
  }

  res = await doFetch(input, merged);
  if (res.status === 401) {
    onForceLogout?.();
  }
  return res;
}

export function installAuthFetch(): void {
  if (typeof window === "undefined") return;
  nativeAuthFetch();
}
