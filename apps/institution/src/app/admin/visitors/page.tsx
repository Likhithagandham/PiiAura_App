"use client";

import { ComingSoonPanel } from "@/components/shared/ComingSoonPanel";
import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminVisitorsPage() {
  return (
    <AdminShell title="Visitors">
      <ComingSoonPanel
        title="Visitors management"
        description="Pre-register guests, issue gate passes, and maintain a visitor log for campus security. This feature is under development — check back in a future release."
      />
    </AdminShell>
  );
}
