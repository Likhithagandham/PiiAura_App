"use client";

import { AuthProvider } from "@eduos/hooks";
import type { ReactNode } from "react";
import { QueryProvider } from "@/components/QueryProvider";
import { SessionGuard } from "@/components/SessionGuard";
import { WebVitals } from "@/components/WebVitals";
import { WalkthroughProvider } from "@/components/walkthrough/WalkthroughContext";
import { WalkthroughRunner } from "@/components/walkthrough/WalkthroughRunner";

export function Providers({ children, initialUser }: { children: ReactNode; initialUser?: import("@eduos/types").AuthUser | null }) {
  return (
    <QueryProvider>
      <AuthProvider initialUser={initialUser ?? undefined}>
        <WalkthroughProvider>
          <WebVitals />
          {children}
          <WalkthroughRunner />
          <SessionGuard />
        </WalkthroughProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
