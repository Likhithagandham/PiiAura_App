"use client";

import { SkeletonText } from "@eduos/ui";
import { Suspense } from "react";
import { PortalTabs } from "@/components/layout/PortalTabs";
import { ParentAssignmentsPanel } from "@/components/parent/panels/ParentAssignmentsPanel";
import { ParentResultsPanel } from "@/components/parent/panels/ParentResultsPanel";
import { useParentUrlTab } from "@/lib/parent/use-parent-url-tab";

const TABS = ["results", "assignments"] as const;

function AcademicsContent() {
  const [tab, setTab] = useParentUrlTab(TABS, "results");

  return (
    <>
      <PortalTabs
        className="eduos-portal-tabs"
        active={tab}
        onChange={setTab}
        tabs={[
          { id: "results", label: "Results" },
          { id: "assignments", label: "Assignments" },
        ]}
      />
      <p className="eduos-section-desc" style={{ marginTop: "0.35rem" }}>
        {tab === "results"
          ? "Published results only — drafts are never shown."
          : "Read-only assignment status and grades."}
      </p>
      {tab === "results" ? <ParentResultsPanel /> : <ParentAssignmentsPanel />}
    </>
  );
}

export default function ParentAcademicsPage() {
  return (
    <Suspense fallback={<SkeletonText lines={4} />}>
      <AcademicsContent />
    </Suspense>
  );
}
