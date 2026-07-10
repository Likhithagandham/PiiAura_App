"use client";

import { SkeletonText } from "@eduos/ui";
import { Suspense } from "react";
import { PortalTabs } from "@/components/layout/PortalTabs";
import { StudentProfilePanel } from "@/components/student/panels/StudentProfilePanel";
import { ActiveSessionsPanel } from "@/components/shared/security/ActiveSessionsPanel";
import { ChangePhonePanel } from "@/components/shared/security/ChangePhonePanel";
import { ChangeEmailPanel } from "@/components/shared/security/ChangeEmailPanel";
import { StudentShell } from "@/components/student/StudentShell";
import { useStudentUrlTab } from "@/lib/student/use-student-url-tab";

const TABS = ["profile", "security"] as const;

function AccountContent() {
  const [tab, setTab] = useStudentUrlTab(TABS, "profile");

  return (
    <>
      <PortalTabs
        className="eduos-portal-tabs"
        active={tab}
        onChange={setTab}
        tabs={[
          { id: "profile", label: "Profile" },
          { id: "security", label: "Security" },
        ]}
      />
      {tab === "profile" ? <StudentProfilePanel /> : null}
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

export default function StudentAccountPage() {
  return (
    <StudentShell title="Account">
      <p className="eduos-section-desc">Profile and account security.</p>
      <Suspense fallback={<SkeletonText lines={4} />}>
        <AccountContent />
      </Suspense>
    </StudentShell>
  );
}
