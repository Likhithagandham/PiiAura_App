"use client";

import { ComingSoonPanel } from "@/components/shared/ComingSoonPanel";
import { FacultyShell } from "@/components/faculty/FacultyShell";

export default function FacultyAiPage() {
  return (
    <FacultyShell title="AI tools">
      <ComingSoonPanel
        title="AI tools"
        description="AI-powered question papers, quizzes, and teaching assistants are on the way. Check back in a future release."
      />
    </FacultyShell>
  );
}
