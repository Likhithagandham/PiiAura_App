"use client";



import {

  createContext,

  useCallback,

  useContext,

  useEffect,

  useMemo,

  useState,

  type ReactNode,

} from "react";

import type { AuthUser, DisambiguationAccount, LinkedAccountOption, LoginResult } from "@eduos/types";

import { AUTH_ERROR_ROLE_CHANGED, AUTH_ROUTES, DASHBOARD_PATH_BY_ROLE } from "@eduos/constants";

import {
  broadcastAuthLogout,
  broadcastAuthSessionRefresh,
  installAuthFetch,
  setAuthFetchHandlers,
  subscribeAuthBroadcast,
} from "./auth-client";



interface AuthContextValue {

  user: AuthUser | null;

  isLoading: boolean;

  linkedAccounts: LinkedAccountOption[];

  login: (identifier: string, password: string) => Promise<LoginResult>;

  completeDisambiguation: (

    token: string,

    userId: string,

    password: string,

  ) => Promise<AuthUser & { mustChangePassword?: boolean }>;

  switchLinkedAccount: (targetUserId: string, password: string) => Promise<AuthUser>;

  logout: () => Promise<void>;

  refreshUser: () => Promise<void>;

}



const AuthContext = createContext<AuthContextValue | null>(null);



function isPublicAuthPage(): boolean {

  if (typeof window === "undefined") return false;

  const path = window.location.pathname;

  return path === AUTH_ROUTES.login || path.startsWith("/forgot-password");

}



function redirectToLogin() {

  if (typeof window === "undefined" || isPublicAuthPage()) return;

  window.location.href = AUTH_ROUTES.login;

}



async function readJsonResponse<T>(res: Response): Promise<T> {

  const contentType = res.headers.get("content-type") ?? "";

  const text = await res.text();



  if (!contentType.includes("application/json")) {

    if (res.status === 404) {

      throw new Error(

        "Auth API not found. Restart the dev server (delete the app .next folder, then run pnpm dev:institution).",

      );

    }

    throw new Error(

      res.ok

        ? "Unexpected server response. Try restarting the dev server."

        : `Request failed (${res.status}). Try restarting the dev server.`,

    );

  }



  try {

    return JSON.parse(text) as T;

  } catch {

    throw new Error("Invalid server response. Try restarting the dev server.");

  }

}



async function parseJson<T>(res: Response): Promise<T> {

  const data = await readJsonResponse<T & { error?: string; code?: string }>(res);

  if (!res.ok) {

    throw new Error(

      typeof data === "object" && data && "error" in data && data.error

        ? String(data.error)

        : "Request failed",

    );

  }

  return data;

}



export function AuthProvider({ children, initialUser }: { children: ReactNode; initialUser?: AuthUser }) {
  const [user, setUser] = useState<AuthUser | null>(initialUser ?? null);
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccountOption[]>([]);
  const [isLoading, setIsLoading] = useState(!initialUser);



  const forceLogout = useCallback(async () => {

    setUser(null);

    setLinkedAccounts([]);

    await fetch("/api/auth/logout", { method: "POST", credentials: "include" }).catch(() => undefined);

    broadcastAuthLogout();

    redirectToLogin();

  }, []);



  const loadLinkedAccounts = useCallback(async () => {

    try {

      const res = await fetch("/api/auth/linked-accounts", { credentials: "include" });

      const data = await readJsonResponse<{ accounts?: LinkedAccountOption[]; code?: string }>(res);

      if (data.code === AUTH_ERROR_ROLE_CHANGED) {

        await forceLogout();

        return;

      }

      if (res.ok && data.accounts) setLinkedAccounts(data.accounts);

      else setLinkedAccounts([]);

    } catch {

      setLinkedAccounts([]);

    }

  }, [forceLogout]);



  const refreshUser = useCallback(async () => {

    try {

      let res = await fetch("/api/auth/me", { credentials: "include" });

      let data = await readJsonResponse<{ user: AuthUser | null; code?: string; error?: string }>(res);



      if (data.code === AUTH_ERROR_ROLE_CHANGED || (data as { error?: string }).error?.includes("role")) {

        await forceLogout();

        return;

      }



      if (!res.ok) {

        const refreshed = await fetch("/api/auth/refresh", {

          method: "POST",

          credentials: "include",

        });

        if (refreshed.ok) {

          res = await fetch("/api/auth/me", { credentials: "include" });

          data = await readJsonResponse<{ user: AuthUser | null; code?: string; error?: string }>(res);

        } else {

          // Transient failure — keep the current session rather than logging out.

          return;

        }

      }



      if (!res.ok) {

        return;

      }



      if (data.user) {

        setUser(data.user);

        void loadLinkedAccounts();

      } else {

        setUser(null);

        setLinkedAccounts([]);

        if (!isPublicAuthPage()) redirectToLogin();

      }

    } catch {

      // Network or parse errors must not sign the user out.

    }

  }, [forceLogout, loadLinkedAccounts]);



  useEffect(() => {
    installAuthFetch();
    setAuthFetchHandlers({ onForceLogout: () => void forceLogout() });

    const unsubscribe = subscribeAuthBroadcast((msg) => {
      if (msg.type === "logout") {
        setUser(null);
        setLinkedAccounts([]);
        redirectToLogin();
      }
      if (msg.type === "session_refresh") {
        void refreshUser();
      }
    });

    let cancelled = false;
    const timeout = window.setTimeout(() => {
      if (!cancelled) setIsLoading(false);
    }, 10_000);

    // If we don't have initialUser, fetch it. If we do, we can just load linked accounts.
    if (!initialUser) {
      refreshUser().finally(() => {
        if (!cancelled) setIsLoading(false);
        window.clearTimeout(timeout);
      });
    } else {
      loadLinkedAccounts().finally(() => {
        if (!cancelled) setIsLoading(false);
        window.clearTimeout(timeout);
      });
    }

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      unsubscribe();
    };
  }, [forceLogout, refreshUser, loadLinkedAccounts, initialUser]);



  const login = useCallback(

    async (identifier: string, password: string) => {

      const res = await fetch("/api/auth/login", {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        credentials: "include",

        body: JSON.stringify({ identifier, password }),

      });

      const result = await parseJson<

        LoginResult | { type: "success"; user: AuthUser }

      >(res);

      if (result.type === "success" && "user" in result) {

        setUser(result.user);

        broadcastAuthSessionRefresh();

        void loadLinkedAccounts();

      }

      return result as LoginResult;

    },

    [loadLinkedAccounts],

  );



  const completeDisambiguation = useCallback(

    async (token: string, userId: string, password: string) => {

      const res = await fetch("/api/auth/disambiguate", {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        credentials: "include",

        body: JSON.stringify({ token, userId, password }),

      });

      const data = await parseJson<{ user: AuthUser; mustChangePassword?: boolean }>(res);

      setUser(data.user);

      broadcastAuthSessionRefresh();

      void loadLinkedAccounts();

      return { ...data.user, mustChangePassword: data.mustChangePassword ?? false };

    },

    [loadLinkedAccounts],

  );



  const switchLinkedAccount = useCallback(

    async (targetUserId: string, password: string) => {

      const res = await fetch("/api/auth/switch-linked", {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        credentials: "include",

        body: JSON.stringify({ targetUserId, password }),

      });

      const data = await parseJson<{ user: AuthUser }>(res);

      setUser(data.user);

      broadcastAuthSessionRefresh();

      void loadLinkedAccounts();

      window.location.href = DASHBOARD_PATH_BY_ROLE[data.user.role];

      return data.user;

    },

    [loadLinkedAccounts],

  );



  const logout = useCallback(async () => {

    await fetch("/api/auth/logout", {

      method: "POST",

      credentials: "include",

    });

    setUser(null);

    setLinkedAccounts([]);

    broadcastAuthLogout();

    redirectToLogin();

  }, []);



  const value = useMemo(

    () => ({

      user,

      isLoading,

      linkedAccounts,

      login,

      completeDisambiguation,

      switchLinkedAccount,

      logout,

      refreshUser,

    }),

    [

      user,

      isLoading,

      linkedAccounts,

      login,

      completeDisambiguation,

      switchLinkedAccount,

      logout,

      refreshUser,

    ],

  );



  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;

}



export function useAuth(): AuthContextValue {

  const ctx = useContext(AuthContext);

  if (!ctx) {

    throw new Error("useAuth must be used within AuthProvider");

  }

  return ctx;

}



export function getDashboardPath(role: AuthUser["role"]): string {

  return DASHBOARD_PATH_BY_ROLE[role];

}



export type { DisambiguationAccount };


