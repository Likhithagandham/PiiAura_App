"use client";

import { ComingSoonPanel } from "@/components/shared/ComingSoonPanel";
import { ParentShell } from "@/components/parent/ParentShell";

export default function ParentLibraryPage() {
  return (
    <ParentShell title="Library">
      <ComingSoonPanel
        title="Digital library"
        description="View books issued to your child and upcoming due dates. This feature is under development — check back in a future release."
      />
    </ParentShell>
  );
}
