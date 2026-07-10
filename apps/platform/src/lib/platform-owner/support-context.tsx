"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useAuth } from "@eduos/hooks";
import type { PlatformSupportSession } from "@eduos/types";
import { apiSend } from "@/lib/api-client";
import { useApiData } from "@/lib/queries";

interface PlatformSupportContextValue {
  session: PlatformSupportSession | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
  exitSupport: () => Promise<boolean>;
}

const PlatformSupportContext = createContext<PlatformSupportContextValue | null>(null);

export function PlatformSupportProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const canFetchSupport = !authLoading && user?.role === "platform_owner";

  const {
    data,
    isLoading: queryLoading,
    refetch,
  } = useApiData<{ session: PlatformSupportSession | null }>("/api/platform-owner/support", {
    enabled: canFetchSupport,
  });

  const value = useMemo<PlatformSupportContextValue>(() => {
    const refresh = async () => {
      await refetch();
    };
    return {
      session: canFetchSupport ? (data?.session ?? null) : null,
      isLoading: authLoading || (canFetchSupport && queryLoading),
      refresh,
      exitSupport: async () => {
        try {
          await apiSend("/api/platform-owner/support", "DELETE");
          await refetch();
          return true;
        } catch {
          return false;
        }
      },
    };
  }, [authLoading, canFetchSupport, data, queryLoading, refetch]);

  return (
    <PlatformSupportContext.Provider value={value}>{children}</PlatformSupportContext.Provider>
  );
}

export function usePlatformSupport(): PlatformSupportContextValue {
  const ctx = useContext(PlatformSupportContext);
  if (!ctx) {
    throw new Error("usePlatformSupport must be used within PlatformSupportProvider");
  }
  return ctx;
}
