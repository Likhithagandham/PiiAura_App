"use client";

import { AuthProvider } from "@eduos/hooks";
import type { ReactNode } from "react";
import { QueryProvider } from "@/components/QueryProvider";
import { SessionGuard } from "@/components/SessionGuard";
import { WebVitals } from "@/components/WebVitals";

export function Providers({ children, initialUser }: { children: ReactNode; initialUser?: import("@eduos/types").AuthUser | null }) {
  return (
    <QueryProvider>
      <AuthProvider initialUser={initialUser ?? undefined}>
        <WebVitals />
        {children}
        <SessionGuard />
      </AuthProvider>
    </QueryProvider>
  );
}
