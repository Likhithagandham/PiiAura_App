"use client";

import { ComingSoonPanel } from "@/components/shared/ComingSoonPanel";
import { StudentShell } from "@/components/student/StudentShell";

export default function StudentLibraryPage() {
  return (
    <StudentShell title="Library">
      <ComingSoonPanel
        title="Digital library"
        description="Browse the school catalogue, reserve books, and track due dates from your portal. This feature is under development — check back in a future release."
      />
    </StudentShell>
  );
}
