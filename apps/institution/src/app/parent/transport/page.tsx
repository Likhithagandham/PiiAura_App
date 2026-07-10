"use client";

import { ComingSoonPanel } from "@/components/shared/ComingSoonPanel";
import { ParentShell } from "@/components/parent/ParentShell";

export default function ParentTransportPage() {
  return (
    <ParentShell title="Transport">
      <ComingSoonPanel
        title="Transport marketplace"
        description="Track your child's bus route, pickup times, and transport fee status. This feature is under development — check back in a future release."
      />
    </ParentShell>
  );
}
