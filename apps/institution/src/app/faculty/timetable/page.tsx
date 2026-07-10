"use client";

import { FacultyShell } from "@/components/faculty/FacultyShell";
import { FacultyTimetableView } from "@/components/faculty/timetable/FacultyTimetableView";

export default function FacultyTimetablePage() {
  return (
    <FacultyShell title="My Timetable">
      <p className="eduos-section-desc">
        Weekly view shows your teaching schedule. Calendar view tracks your personal attendance.
      </p>
      <FacultyTimetableView />
    </FacultyShell>
  );
}
