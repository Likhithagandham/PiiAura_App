"use client";

import { SkeletonText } from "@eduos/ui";
import { Suspense } from "react";
import { PortalTabs } from "@/components/layout/PortalTabs";
import { NotificationChannelPreferencesPanel } from "@/components/shared/NotificationChannelPreferencesPanel";
import { ParentAlertsPanel } from "@/components/parent/panels/ParentAlertsPanel";
import { ParentAnnouncementsPanel } from "@/components/parent/panels/ParentAnnouncementsPanel";
import { ParentGrievancesPanel } from "@/components/parent/panels/ParentGrievancesPanel";
import { ActiveSessionsPanel } from "@/components/shared/security/ActiveSessionsPanel";
import { ChangePhonePanel } from "@/components/shared/security/ChangePhonePanel";
import { ChangeEmailPanel } from "@/components/shared/security/ChangeEmailPanel";
import { useParentUrlTab } from "@/lib/parent/use-parent-url-tab";

const TABS = ["grievances", "notifications", "absence-alerts", "announcements", "security"] as const;

function AccountContent() {
  const [tab, setTab] = useParentUrlTab(TABS, "grievances");

  return (
    <>
      <PortalTabs
        className="eduos-portal-tabs"
        active={tab}
        onChange={setTab}
        tabs={[
          { id: "grievances", label: "Grievances" },
          { id: "notifications", label: "Notifications" },
          { id: "absence-alerts", label: "Absence alerts" },
          { id: "announcements", label: "Notices" },
          { id: "security", label: "Security" },
        ]}
      />
      {tab === "grievances" ? <ParentGrievancesPanel /> : null}
      {tab === "notifications" ? (
        <NotificationChannelPreferencesPanel
          apiUrl="/api/parent/notifications"
          description="Account-wide channel preferences. Per-child absence alerts can be set separately below."
        />
      ) : null}
      {tab === "absence-alerts" ? <ParentAlertsPanel /> : null}
      {tab === "announcements" ? <ParentAnnouncementsPanel /> : null}
      {tab === "security" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <ActiveSessionsPanel />
          <ChangePhonePanel />
          <ChangeEmailPanel />
        </div>
      ) : null}
    </>
  );
}

export default function ParentAccountPage() {
  return (
    <Suspense fallback={<SkeletonText lines={4} />}>
      <AccountContent />
    </Suspense>
  );
}
