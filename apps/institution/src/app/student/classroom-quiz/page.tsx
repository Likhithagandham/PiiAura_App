"use client";

import { ComingSoonPanel } from "@/components/shared/ComingSoonPanel";
import { StudentShell } from "@/components/student/StudentShell";

export default function StudentClassroomQuizPage() {
  return (
    <StudentShell title="Classroom quiz">
      <ComingSoonPanel
        title="Classroom quiz"
        description="Join live in-class quizzes started by your teacher, answer on your device, and see instant results. This feature is under development — check back in a future release."
      />
    </StudentShell>
  );
}
