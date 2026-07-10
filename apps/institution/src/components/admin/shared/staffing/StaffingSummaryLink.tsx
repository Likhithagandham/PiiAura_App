"use client";

import Link from "next/link";

export function StaffingSummaryLink({
  sectionId,
  label = "Manage in Academics → Staffing",
}: {
  sectionId?: string;
  label?: string;
}) {
  const href = sectionId
    ? `/admin/academics?tab=Staffing&sectionId=${encodeURIComponent(sectionId)}`
    : "/admin/academics?tab=Staffing";
  return (
    <Link href={href} style={{ color: "var(--eduos-primary)", textDecoration: "underline" }}>
      {label}
    </Link>
  );
}
