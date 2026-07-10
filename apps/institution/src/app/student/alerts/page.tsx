"use client";

import { AlertsInboxPanel } from "@eduos/ui";
import { StudentShell } from "@/components/student/StudentShell";

export default function StudentAlertsPage() {
  return (
    <StudentShell title="Alerts">
      <p className="eduos-section-desc">
        Personal reminders about fees, attendance, and exams — not school notices (see Notices in the menu).
      </p>
      <AlertsInboxPanel apiUrl="/api/student/alerts" />
    </StudentShell>
  );
}
