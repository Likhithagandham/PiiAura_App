"use client";

import { PeopleManagementPanel } from "@/components/shared/people/PeopleManagementPanel";
import { AdminShell } from "../AdminShell";

export function UserManagementView() {
  return (
    <AdminShell title="Users">
      <PeopleManagementPanel
        config={{
          scope: "admin",
          usersApiBase: "/api/admin/users",
          usersActionsApiBase: "/api/admin/users/actions",
          guardiansApiBase: "/api/admin/guardians",
        }}
      />
    </AdminShell>
  );
}
