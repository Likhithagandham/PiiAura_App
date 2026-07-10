"use client";

import {
  ADMIN_ROUTES,
  type InstitutionType,
} from "@eduos/constants";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useApiData } from "@/lib/queries";

interface AdminScopeContextValue {
  institutionType: InstitutionType | null;
  settingsReady: boolean;
  setInstitutionType: (type: InstitutionType) => void;
  changeInstitutionType: (type: InstitutionType) => Promise<void>;
}

const AdminScopeContext = createContext<AdminScopeContextValue | null>(null);

let cachedInstitutionType: InstitutionType | null = null;

export function AdminScopeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  // Local override seeds from the module cache so a remount paints instantly and,
  // once set, wins over the (background-cached) settings query.
  const [override, setOverride] = useState<InstitutionType | null>(cachedInstitutionType);
  const scopeChangeRef = useRef(false);

  const { data, error } = useApiData<{ institutionType?: string }>("/api/admin/settings", {
    enabled: override === null,
    staleTime: 5 * 60_000,
  });

  const settingsReady = override !== null || data !== undefined || error != null;
  const institutionType: InstitutionType | null =
    override ??
    (data
      ? data.institutionType === "college"
        ? "college"
        : "school"
      : error
        ? "school"
        : null);

  const setInstitutionType = useCallback((type: InstitutionType) => {
    cachedInstitutionType = type;
    setOverride(type);
  }, []);

  // Keep the module cache warm for the next mount.
  useEffect(() => {
    if (institutionType) cachedInstitutionType = institutionType;
  }, [institutionType]);

  useEffect(() => {
    if (!settingsReady || !institutionType || scopeChangeRef.current) return;
    if (institutionType === "school" && pathname.startsWith(ADMIN_ROUTES.college)) {
      router.replace(ADMIN_ROUTES.school);
      return;
    }
    if (institutionType === "college" && pathname.startsWith(ADMIN_ROUTES.school)) {
      router.replace(ADMIN_ROUTES.college);
    }
  }, [settingsReady, institutionType, pathname, router]);

  const changeInstitutionType = useCallback(
    async (next: InstitutionType) => {
      if (next === institutionType) return;
      scopeChangeRef.current = true;
      setInstitutionType(next);
      await fetch("/api/admin/settings", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "institution-type", data: { institutionType: next } }),
      });
      if (pathname.startsWith(ADMIN_ROUTES.school) || pathname.startsWith(ADMIN_ROUTES.college)) {
        router.replace(next === "school" ? ADMIN_ROUTES.school : ADMIN_ROUTES.college);
      }
      scopeChangeRef.current = false;
    },
    [institutionType, pathname, router, setInstitutionType],
  );

  const value = useMemo(
    () => ({
      institutionType,
      settingsReady,
      setInstitutionType,
      changeInstitutionType,
    }),
    [institutionType, settingsReady, setInstitutionType, changeInstitutionType],
  );

  return <AdminScopeContext.Provider value={value}>{children}</AdminScopeContext.Provider>;
}

export function useAdminScope(): AdminScopeContextValue {
  const ctx = useContext(AdminScopeContext);
  if (!ctx) {
    throw new Error("useAdminScope must be used within AdminScopeProvider");
  }
  return ctx;
}
