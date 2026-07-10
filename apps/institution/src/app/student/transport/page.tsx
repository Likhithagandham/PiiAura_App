"use client";

import { ComingSoonPanel } from "@/components/shared/ComingSoonPanel";
import { StudentShell } from "@/components/student/StudentShell";

export default function StudentTransportPage() {
  return (
    <StudentShell title="Transport">
      <ComingSoonPanel
        title="Transport marketplace"
        description="Browse bus routes, track your vehicle, and manage transport fees in one place. This feature is under development — check back in a future release."
      />
    </StudentShell>
  );
}
