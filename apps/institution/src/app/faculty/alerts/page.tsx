"use client";

import { AlertsInboxPanel } from "@eduos/ui";
import { FacultyShell } from "@/components/faculty/FacultyShell";

export default function FacultyAlertsPage() {
  return (
    <FacultyShell title="Alerts">
      <p className="eduos-section-desc">Attendance, leave, and duty reminders for your classes.</p>
      <AlertsInboxPanel apiUrl="/api/faculty/alerts" />
    </FacultyShell>
  );
}
