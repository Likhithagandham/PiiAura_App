"use client";

import { ComingSoonPanel } from "@/components/shared/ComingSoonPanel";
import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminTransportPage() {
  return (
    <AdminShell title="Transport">
      <ComingSoonPanel
        title="Transport marketplace"
        description="Manage routes, vendors, vehicle assignments, and transport fee reconciliation. This feature is under development — check back in a future release."
      />
    </AdminShell>
  );
}
