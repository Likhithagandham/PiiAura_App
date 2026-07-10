"use client";

import { Suspense } from "react";
import { PortalTabs } from "@/components/layout/PortalTabs";
import { SuperAdminShell } from "@/components/super-admin/SuperAdminShell";
import { useSuperAdminUrlTab } from "@/lib/super-admin/use-super-admin-url-tab";
import { SuperAdminAnalyticsView } from "@/app/super-admin/analytics/page";
import { SuperAdminResultsComparisonView } from "@/app/super-admin/results/page";

const TABS = ["analytics", "results"] as const;
type TabId = (typeof TABS)[number];

function InsightsInner() {
  const [tab, setTab] = useSuperAdminUrlTab<TabId>(TABS, "analytics");

  return (
    <SuperAdminShell title="Insights">
      <PortalTabs
        tabs={[
          { id: "analytics", label: "Analytics" },
          { id: "results", label: "Results comparison" },
        ]}
        active={tab}
        onChange={setTab}
      />

      <div style={{ marginTop: "0.75rem" }}>
        {tab === "analytics" ? <SuperAdminAnalyticsView embedded /> : null}
        {tab === "results" ? <SuperAdminResultsComparisonView embedded /> : null}
      </div>
    </SuperAdminShell>
  );
}

export default function SuperAdminInsightsPage() {
  return (
    <Suspense>
      <InsightsInner />
    </Suspense>
  );
}

