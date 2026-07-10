"use client";

import { Suspense } from "react";
import { PortalTabs } from "@/components/layout/PortalTabs";
import { SuperAdminShell } from "@/components/super-admin/SuperAdminShell";
import { useSuperAdminUrlTab } from "@/lib/super-admin/use-super-admin-url-tab";
import { SuperAdminFeesView } from "@/app/super-admin/fees/page";
import { SuperAdminDefaultersView } from "@/app/super-admin/defaulters/page";
import { SuperAdminExportsView } from "@/app/super-admin/exports/page";

const TABS = ["fees", "defaulters", "exports"] as const;
type TabId = (typeof TABS)[number];

function FinanceInner() {
  const [tab, setTab] = useSuperAdminUrlTab<TabId>(TABS, "fees");

  return (
    <SuperAdminShell title="Finance">
      <PortalTabs
        tabs={[
          { id: "fees", label: "Fee templates" },
          { id: "defaulters", label: "Defaulter report" },
          { id: "exports", label: "Exports" },
        ]}
        active={tab}
        onChange={setTab}
      />

      <div style={{ marginTop: "0.75rem" }}>
        {tab === "fees" ? <SuperAdminFeesView embedded /> : null}
        {tab === "defaulters" ? <SuperAdminDefaultersView embedded /> : null}
        {tab === "exports" ? <SuperAdminExportsView embedded /> : null}
      </div>
    </SuperAdminShell>
  );
}

export default function SuperAdminFinancePage() {
  // Mirror the fees page pattern: wrap in Suspense for the URL tab hook.
  return (
    <Suspense>
      <FinanceInner />
    </Suspense>
  );
}

