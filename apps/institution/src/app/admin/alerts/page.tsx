"use client";

import { AlertsInboxPanel } from "@eduos/ui";
import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminAlertsPage() {
  return (
    <AdminShell title="Needs attention">
      <p className="eduos-section-desc">
        Operational items that need a follow-up — low attendance, pending fees, incomplete profiles, and similar.
        This is separate from notices you publish under Engagement.
      </p>
      <AlertsInboxPanel apiUrl="/api/admin/alerts" />
    </AdminShell>
  );
}
