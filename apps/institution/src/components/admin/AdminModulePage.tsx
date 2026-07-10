"use client";

import type { AdminModuleId } from "@eduos/constants";
import { ADMIN_NAV } from "@eduos/constants";
import { AdminShell } from "./AdminShell";
import { ModulePlaceholder } from "./ModulePlaceholder";

interface AdminModulePageProps {
  moduleId: AdminModuleId;
}

export function AdminModulePage({ moduleId }: AdminModulePageProps) {
  const module = ADMIN_NAV.find((m) => m.id === moduleId);
  if (!module) return null;

  return (
    <AdminShell title={module.label}>
      <ModulePlaceholder module={module} />
    </AdminShell>
  );
}
