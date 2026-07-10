"use client";

import { ComingSoonPanel } from "@/components/shared/ComingSoonPanel";
import { SuperAdminShell } from "@/components/super-admin/SuperAdminShell";

export default function SuperAdminHrPayrollPage() {
  return (
    <SuperAdminShell title="HR & Payroll">
      <ComingSoonPanel
        title="Tenant-wide HR & payroll"
        description="Consolidated employee records, leave balances, and payroll runs across all campuses will appear here. Branch admins can already manage HR from their portal — this super-admin view is under development."
      />
    </SuperAdminShell>
  );
}
