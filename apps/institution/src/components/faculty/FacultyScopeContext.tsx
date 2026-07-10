"use client";

import { type InstitutionType } from "@eduos/constants";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useApiData } from "@/lib/queries";

interface FacultyScopeContextValue {
  institutionType: InstitutionType | null;
  settingsReady: boolean;
  setInstitutionType: (type: InstitutionType) => void;
}

const FacultyScopeContext = createContext<FacultyScopeContextValue | null>(null);

let cachedInstitutionType: InstitutionType | null = null;

export function FacultyScopeProvider({ children }: { children: ReactNode }) {
  // Local override seeds from the module cache so a remount paints instantly and,
  // once set, wins over the (background-cached) settings query.
  const [override, setOverride] = useState<InstitutionType | null>(cachedInstitutionType);
  const { data, error } = useApiData<{ institutionType?: string }>("/api/faculty/settings", {
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

  // Keep the module cache warm for the next mount.
  useEffect(() => {
    if (institutionType) cachedInstitutionType = institutionType;
  }, [institutionType]);

  const setInstitutionType = useCallback((type: InstitutionType) => {
    cachedInstitutionType = type;
    setOverride(type);
  }, []);

  const value = useMemo(
    () => ({ institutionType, settingsReady, setInstitutionType }),
    [institutionType, settingsReady, setInstitutionType],
  );

  return <FacultyScopeContext.Provider value={value}>{children}</FacultyScopeContext.Provider>;
}

export function useFacultyScope() {
  const ctx = useContext(FacultyScopeContext);
  if (!ctx) throw new Error("useFacultyScope must be used within FacultyScopeProvider");
  return ctx;
}
