"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { SkeletonText } from "@eduos/ui";
import { FacultyAnnouncementsPanel } from "@/components/faculty/panels/FacultyAnnouncementsPanel";
import { FacultyProfilePanel } from "@/components/faculty/panels/FacultyProfilePanel";
import { FacultyShell } from "@/components/faculty/FacultyShell";
import { ActiveSessionsPanel } from "@/components/shared/security/ActiveSessionsPanel";
import { ChangePhonePanel } from "@/components/shared/security/ChangePhonePanel";
import { ChangeEmailPanel } from "@/components/shared/security/ChangeEmailPanel";

function AccountContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");

  const navLinks = (
    <p className="eduos-section-desc">
      <Link href={pathname} className={!tab ? "eduos-link eduos-link--active" : "eduos-link"}>
        Notices
      </Link>
      {" · "}
      <Link href={`${pathname}?tab=profile`} className={tab === "profile" ? "eduos-link eduos-link--active" : "eduos-link"}>
        Profile
      </Link>
      {" · "}
      <Link href={`${pathname}?tab=security`} className={tab === "security" ? "eduos-link eduos-link--active" : "eduos-link"}>
        Security
      </Link>
    </p>
  );

  if (tab === "profile") {
    return (
      <>
        {navLinks}
        <FacultyProfilePanel />
      </>
    );
  }

  if (tab === "security") {
    return (
      <>
        {navLinks}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <ActiveSessionsPanel />
          <ChangePhonePanel />
          <ChangeEmailPanel />
        </div>
      </>
    );
  }

  return (
    <>
      {navLinks}
      <FacultyAnnouncementsPanel />
    </>
  );
}

export default function FacultyAccountPage() {
  return (
    <FacultyShell title="Account">
      <Suspense fallback={<SkeletonText lines={4} />}>
        <AccountContent />
      </Suspense>
    </FacultyShell>
  );
}
