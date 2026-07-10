"use client";

import { ComingSoonPanel } from "@/components/shared/ComingSoonPanel";
import { FacultyShell } from "@/components/faculty/FacultyShell";

export default function FacultyLibraryPage() {
  return (
    <FacultyShell title="Library">
      <ComingSoonPanel
        title="Digital library"
        description="Browse the campus catalogue and manage book recommendations for your students. This feature is under development — check back in a future release."
      />
    </FacultyShell>
  );
}
