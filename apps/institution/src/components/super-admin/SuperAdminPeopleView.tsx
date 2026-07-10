"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type { AssignableRole } from "@eduos/types";
import { PeopleManagementPanel } from "@/components/shared/people/PeopleManagementPanel";
import { useSuperAdminBranchesQuery } from "@/lib/queries";

export function SuperAdminPeopleView() {
  const params = useSearchParams();
  const { data: branchesData } = useSuperAdminBranchesQuery();
  const branches = useMemo(
    () => (branchesData?.branches ?? []).map((b) => ({ id: b.id, name: b.name })),
    [branchesData?.branches],
  );

  const initialBranch = params.get("branch") ?? "all";
  const initialRole = (params.get("role") as "all" | AssignableRole | null) ?? "all";

  const config = useMemo(
    () => ({
      scope: "super_admin" as const,
      usersApiBase: "/api/super-admin/users",
      usersActionsApiBase: "/api/super-admin/users/actions",
      guardiansApiBase: "/api/super-admin/guardians",
      branchOptions: branches,
      initialBranch,
      initialRole,
      showBranchColumn: true,
      requireBranchOnCreate: true,
    }),
    [branches, initialBranch, initialRole],
  );

  return <PeopleManagementPanel key={`${initialBranch}-${initialRole}`} config={config} />;
}
