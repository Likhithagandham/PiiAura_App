"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { StudentChild } from "@eduos/types";

type ParentChildContextValue = {
  children: StudentChild[];
  childId: string | null;
  activeChild: StudentChild | null;
  setChildId: (id: string) => void;
  loading: boolean;
  error: string | null;
  portalBlocked: boolean;
  href: (path: string) => string;
};

const ParentChildContext = createContext<ParentChildContextValue | null>(null);

export function ParentChildProvider({ children: content }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [children, setChildren] = useState<StudentChild[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [portalBlocked, setPortalBlocked] = useState(false);

  const childId = searchParams.get("childId");

  const href = useCallback(
    (path: string) => {
      const id = childId ?? children[0]?.id;
      if (!id) return path;
      const [base, query = ""] = path.split("?");
      const params = new URLSearchParams(query);
      params.set("childId", id);
      return `${base}?${params.toString()}`;
    },
    [childId, children],
  );

  const loadChildren = useCallback(async () => {
    setError(null);
    const res = await fetch("/api/parent/children", { credentials: "include" });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = json as { error?: string; code?: string };
      setPortalBlocked(err.code === "parent_portal_disabled");
      setError(err.error ?? "Could not load children");
      setChildren([]);
      return;
    }
    const payload = json as {
      children: StudentChild[];
      access?: { allowed: boolean; reason?: string };
    };
    if (payload.access && !payload.access.allowed) {
      setPortalBlocked(true);
      setError(payload.access.reason ?? "Parent portal unavailable");
      setChildren([]);
      return;
    }
    setPortalBlocked(false);
    const list = payload.children ?? [];
    setChildren(list);
    if (list.length === 0) {
      setError("No children are linked to your account. Contact the institution office.");
      return;
    }
    if (!searchParams.get("childId")) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("childId", list[0]!.id);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [router, pathname, searchParams]);

  useEffect(() => {
    loadChildren().finally(() => setLoading(false));
  }, [loadChildren]);

  const setChildId = useCallback(
    (id: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("childId", id);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const activeChild = useMemo(
    () => children.find((c) => c.id === childId) ?? children[0] ?? null,
    [children, childId],
  );

  const value = useMemo(
    () => ({ children, childId, activeChild, setChildId, loading, error, portalBlocked, href }),
    [children, childId, activeChild, setChildId, loading, error, portalBlocked, href],
  );

  return <ParentChildContext.Provider value={value}>{content}</ParentChildContext.Provider>;
}

export function useParentChild() {
  const ctx = useContext(ParentChildContext);
  if (!ctx) throw new Error("useParentChild must be used within ParentChildProvider");
  return ctx;
}

export function parentApiUrl(path: string, childId: string | null): string {
  if (!childId) return path;
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}childId=${encodeURIComponent(childId)}`;
}
