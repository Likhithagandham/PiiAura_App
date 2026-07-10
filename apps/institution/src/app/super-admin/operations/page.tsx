"use client";

import { Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PortalTabs } from "@/components/layout/PortalTabs";
import { SuperAdminShell } from "@/components/super-admin/SuperAdminShell";
import { SuperAdminOperationsOverview } from "@/components/super-admin/SuperAdminOperationsOverview";
import { SuperAdminPeopleView } from "@/components/super-admin/SuperAdminPeopleView";
import { useSuperAdminUrlTab } from "@/lib/super-admin/use-super-admin-url-tab";
import { SuperAdminBranchesView } from "@/app/super-admin/branches/page";
import { SuperAdminAcademicYearsView } from "@/app/super-admin/academic-years/page";

const TABS = ["overview", "people", "branches", "academicYears"] as const;
type TabId = (typeof TABS)[number];

function OperationsInner() {
  const [tab, setTab] = useSuperAdminUrlTab<TabId>(TABS, "overview");
  const router = useRouter();
  const params = useSearchParams();

  const goToPeople = useCallback(
    (branchId: string) => {
      const sp = new URLSearchParams(params.toString());
      sp.set("tab", "people");
      sp.set("branch", branchId);
      router.replace(`/super-admin/operations?${sp.toString()}`);
    },
    [params, router],
  );

  return (
    <SuperAdminShell title="Operations">
      <PortalTabs
        tabs={[
          { id: "overview", label: "Overview" },
          { id: "people", label: "People" },
          { id: "branches", label: "Branches" },
          { id: "academicYears", label: "Academic years" },
        ]}
        active={tab}
        onChange={setTab}
      />

      <div style={{ marginTop: "0.75rem" }}>
        {tab === "overview" ? <SuperAdminOperationsOverview onSelectBranch={goToPeople} /> : null}
        {tab === "people" ? <SuperAdminPeopleView /> : null}
        {tab === "branches" ? <SuperAdminBranchesView embedded /> : null}
        {tab === "academicYears" ? <SuperAdminAcademicYearsView embedded /> : null}
      </div>
    </SuperAdminShell>
  );
}

export default function SuperAdminOperationsPage() {
  return (
    <Suspense>
      <OperationsInner />
    </Suspense>
  );
}
