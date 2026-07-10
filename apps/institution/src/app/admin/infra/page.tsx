"use client";

import { ComingSoonPanel } from "@/components/shared/ComingSoonPanel";
import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminInfraPage() {
  return (
    <AdminShell title="Infra management">
      <ComingSoonPanel
        title="Infrastructure management"
        description="Track classrooms, labs, assets, maintenance requests, and facility bookings. This feature is under development — check back in a future release."
      />
    </AdminShell>
  );
}
