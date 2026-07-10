"use client";

import { ComingSoonPanel } from "@/components/shared/ComingSoonPanel";
import { StudentShell } from "@/components/student/StudentShell";

export default function StudentAssistantPage() {
  return (
    <StudentShell title="Assistant">
      <ComingSoonPanel
        title="AI chatbot assistant"
        description="Ask questions about timetable, homework, fees, and notices in plain language. Your personal campus assistant is on the way — check back in a future release."
      />
    </StudentShell>
  );
}
