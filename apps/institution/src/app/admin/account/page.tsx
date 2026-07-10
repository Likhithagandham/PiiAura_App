"use client";

import { Suspense } from "react";
import { SkeletonText } from "@eduos/ui";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminAccountProfilePanel } from "@/components/admin/account/AdminAccountProfilePanel";
import { PortalTabs } from "@/components/layout/PortalTabs";
import { ActiveSessionsPanel } from "@/components/shared/security/ActiveSessionsPanel";
import { ChangeEmailPanel } from "@/components/shared/security/ChangeEmailPanel";
import { ChangePhonePanel } from "@/components/shared/security/ChangePhonePanel";
import { useAdminUrlTab } from "@/lib/admin/use-admin-url-tab";

const TABS = ["profile", "security"] as const;

function AccountContent() {
  const [tab, setTab] = useAdminUrlTab(TABS, "profile");

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
      {tab === "profile" ? <AdminAccountProfilePanel /> : null}
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

export default function AdminAccountPage() {
  return (
    <AdminShell title="Account">
      <p className="eduos-section-desc">Your branch admin profile and institution access.</p>
      <Suspense fallback={<SkeletonText lines={6} />}>
        <AccountContent />
      </Suspense>
    </AdminShell>
  );
}
