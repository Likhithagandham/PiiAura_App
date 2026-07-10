"use client";

import { ComingSoonPanel } from "@/components/shared/ComingSoonPanel";
import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminLibraryPage() {
  return (
    <AdminShell title="Library">
      <ComingSoonPanel
        title="Library management"
        description="Catalogue books, manage issues and returns, and track overdue items across your campus. This feature is under development — check back in a future release."
      />
    </AdminShell>
  );
}
