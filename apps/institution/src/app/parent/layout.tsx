"use client";

import { Suspense, type ReactNode } from "react";
import { LoadingScreen } from "@eduos/ui";
import { ParentShell } from "@/components/parent/ParentShell";
import { ParentChildProvider } from "@/lib/parent/parent-child-context";

export default function ParentLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <ParentChildProvider>
        <ParentShell>{children}</ParentShell>
      </ParentChildProvider>
    </Suspense>
  );
}
