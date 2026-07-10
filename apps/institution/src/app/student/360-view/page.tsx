"use client";

import { ComingSoonPanel } from "@/components/shared/ComingSoonPanel";
import { StudentShell } from "@/components/student/StudentShell";

export default function Student360ViewPage() {
  return (
    <StudentShell title="360° view">
      <ComingSoonPanel
        title="360° campus view"
        description="Explore your school or college in an immersive 360° virtual tour. This feature is under development — check back in a future release."
      />
    </StudentShell>
  );
}
