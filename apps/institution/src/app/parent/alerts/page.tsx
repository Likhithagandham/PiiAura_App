"use client";

import { AlertsInboxPanel } from "@eduos/ui";
import { parentApiUrl, useParentChild } from "@/lib/parent/parent-child-context";

export default function ParentAlertsPage() {
  const { childId } = useParentChild();

  if (!childId) {
    return null;
  }

  return (
    <>
      <p className="eduos-section-desc">
        Personal reminders for your selected child — fees, attendance, and exams. School messages from the
        institution appear under Account → Notices.
      </p>
      <AlertsInboxPanel apiUrl={parentApiUrl("/api/parent/alerts", childId)} />
    </>
  );
}
