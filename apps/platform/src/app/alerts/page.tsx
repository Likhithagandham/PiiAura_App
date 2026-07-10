"use client";

import { AlertsInboxPanel } from "@eduos/ui";
import { PlatformOwnerShell } from "@/components/platform-owner/PlatformOwnerShell";

export default function PlatformAlertsPage() {
  return (
    <PlatformOwnerShell title="Alerts">
      <p className="eduos-section-desc">Platform-wide operational alerts across tenants and integrations.</p>
      <AlertsInboxPanel apiUrl="/api/platform-owner/alerts" />
    </PlatformOwnerShell>
  );
}
