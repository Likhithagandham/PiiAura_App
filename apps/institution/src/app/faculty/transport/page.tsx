"use client";

import { ComingSoonPanel } from "@/components/shared/ComingSoonPanel";
import { FacultyShell } from "@/components/faculty/FacultyShell";

export default function FacultyTransportPage() {
  return (
    <FacultyShell title="Transport">
      <ComingSoonPanel
        title="Transport marketplace"
        description="View assigned routes and transport schedules for your classes. This feature is under development — check back in a future release."
      />
    </FacultyShell>
  );
}
