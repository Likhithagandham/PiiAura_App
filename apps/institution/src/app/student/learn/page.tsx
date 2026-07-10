"use client";

import { SkeletonText } from "@eduos/ui";
import { Suspense } from "react";
import { ComingSoonPanel } from "@/components/shared/ComingSoonPanel";
import { PortalTabs } from "@/components/layout/PortalTabs";
import { StudentAssignmentsPanel } from "@/components/student/panels/StudentAssignmentsPanel";
import { StudentMaterialsPanel } from "@/components/student/panels/StudentMaterialsPanel";
import { StudentShell } from "@/components/student/StudentShell";
import { useStudentUrlTab } from "@/lib/student/use-student-url-tab";

const TABS = ["materials", "assignments", "videos"] as const;
type LearnTab = (typeof TABS)[number];

const TAB_COPY: Record<LearnTab, string> = {
  materials: "Browse materials by subject and syllabus unit.",
  assignments: "Submit assignments with file upload (mock S3).",
  videos: "Recorded lectures and revision videos.",
};

function LearnContent() {
  const [tab, setTab] = useStudentUrlTab(TABS, "materials");

  return (
    <>
      <PortalTabs
        className="eduos-portal-tabs"
        active={tab}
        onChange={setTab}
        tabs={[
          { id: "materials", label: "Study material" },
          { id: "assignments", label: "Assignments" },
          { id: "videos", label: "Video content" },
        ]}
      />
      <p className="eduos-section-desc">{TAB_COPY[tab]}</p>
      {tab === "materials" ? <StudentMaterialsPanel /> : null}
      {tab === "assignments" ? <StudentAssignmentsPanel /> : null}
      {tab === "videos" ? (
        <ComingSoonPanel
          title="Video content"
          description="Watch recorded lectures, chapter revisions, and topic explainers from your teachers. This feature is under development — check back in a future release."
        />
      ) : null}
    </>
  );
}

export default function StudentLearnPage() {
  return (
    <StudentShell title="Learn">
      <Suspense fallback={<SkeletonText lines={4} />}>
        <LearnContent />
      </Suspense>
    </StudentShell>
  );
}
