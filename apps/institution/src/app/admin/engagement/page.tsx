"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PortalTabs } from "@/components/layout/PortalTabs";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminAnnouncementsPanel } from "@/components/admin/engagement/AdminAnnouncementsPanel";
import { CommsDeliveryComingSoon } from "@/components/admin/engagement/CommsDeliveryComingSoon";
import { useAdminUrlTab } from "@/lib/admin/use-admin-url-tab";
import { SkeletonText } from "@eduos/ui";

const TABS = ["notices", "delivery"] as const;

function LegacyTabRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const raw = searchParams.get("tab");
    if (raw === "announcements") {
      router.replace(`${pathname}?tab=notices`, { scroll: false });
    } else if (raw === "communications") {
      router.replace(`${pathname}?tab=delivery`, { scroll: false });
    }
  }, [searchParams, router, pathname]);

  return null;
}

function EngagementContent() {
  const [tab, setTab] = useAdminUrlTab(TABS, "notices");

  return (
    <>
      <LegacyTabRedirect />
      <PortalTabs
        className="eduos-portal-tabs"
        active={tab}
        onChange={setTab}
        tabs={[
          { id: "notices", label: "Notices" },
          { id: "delivery", label: "Delivery" },
        ]}
      />
      <div style={{ marginTop: "0.75rem" }}>
        {tab === "notices" ? <AdminAnnouncementsPanel /> : null}
        {tab === "delivery" ? <CommsDeliveryComingSoon /> : null}
      </div>
    </>
  );
}

export default function AdminEngagementPage() {
  return (
    <AdminShell title="Engagement">
      <p className="eduos-section-desc">
        Publish in-app notices for your branch. SMS and email delivery will be available under the Delivery tab.
      </p>
      <Suspense fallback={<SkeletonText lines={4} />}>
        <EngagementContent />
      </Suspense>
    </AdminShell>
  );
}
