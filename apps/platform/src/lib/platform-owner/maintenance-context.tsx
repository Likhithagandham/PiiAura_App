"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { PlatformMaintenanceMode } from "@eduos/types";
import { useApiData } from "@/lib/queries";

interface PlatformMaintenanceContextValue {
  maintenance: PlatformMaintenanceMode | null;
  refresh: () => Promise<void>;
}

const PlatformMaintenanceContext = createContext<PlatformMaintenanceContextValue | null>(null);

export function PlatformMaintenanceProvider({ children }: { children: ReactNode }) {
  const { data, refetch } = useApiData<{ maintenance: PlatformMaintenanceMode }>(
    "/api/platform-owner/maintenance",
  );

  const value = useMemo<PlatformMaintenanceContextValue>(
    () => ({
      maintenance: data?.maintenance ?? null,
      refresh: async () => {
        await refetch();
      },
    }),
    [data, refetch],
  );

  return (
    <PlatformMaintenanceContext.Provider value={value}>
      {children}
    </PlatformMaintenanceContext.Provider>
  );
}

export function usePlatformMaintenance(): PlatformMaintenanceContextValue {
  const ctx = useContext(PlatformMaintenanceContext);
  if (!ctx) {
    throw new Error("usePlatformMaintenance must be used within PlatformMaintenanceProvider");
  }
  return ctx;
}
