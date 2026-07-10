"use client";

import { Suspense } from "react";
import { PortalTabs } from "@/components/layout/PortalTabs";
import { SuperAdminShell } from "@/components/super-admin/SuperAdminShell";
import { useSuperAdminUrlTab } from "@/lib/super-admin/use-super-admin-url-tab";
import { SuperAdminAnnouncementsView } from "@/app/super-admin/announcements/page";
import { SuperAdminTicketsView } from "@/app/super-admin/tickets/page";

const TABS = ["announcements", "tickets"] as const;
type TabId = (typeof TABS)[number];

function EngagementInner() {
  const [tab, setTab] = useSuperAdminUrlTab<TabId>(TABS, "announcements");

  return (
    <SuperAdminShell title="Engagement">
      <PortalTabs
        tabs={[
          { id: "announcements", label: "Announcements" },
          { id: "tickets", label: "Support tickets" },
        ]}
        active={tab}
        onChange={setTab}
      />

      <div style={{ marginTop: "0.75rem" }}>
        {tab === "announcements" ? <SuperAdminAnnouncementsView embedded /> : null}
        {tab === "tickets" ? <SuperAdminTicketsView embedded /> : null}
      </div>
    </SuperAdminShell>
  );
}

export default function SuperAdminEngagementPage() {
  return (
    <Suspense>
      <EngagementInner />
    </Suspense>
  );
}

