"use client";

import { AlertsInboxPanel } from "@eduos/ui";
import { SuperAdminShell } from "@/components/super-admin/SuperAdminShell";

export default function SuperAdminAlertsPage() {
  return (
    <SuperAdminShell title="Alerts">
      <p className="eduos-section-desc">Cross-branch operational alerts for your institution.</p>
      <AlertsInboxPanel apiUrl="/api/super-admin/alerts" />
    </SuperAdminShell>
  );
}
