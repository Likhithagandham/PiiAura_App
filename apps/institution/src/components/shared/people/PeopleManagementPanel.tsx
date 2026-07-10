"use client";

import { useMemo, useState } from "react";
import type { AssignableRole, ManagedUser } from "@eduos/types";
import { Button, DataTable, type DataTableColumn, EmptyState } from "@eduos/ui";
import { useUserManagementQuery } from "@/lib/queries";
import { useLicensingStudentsQuery } from "@/lib/licensing-queries";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { AddUserWizardModal } from "@/components/admin/users/AddUserWizardModal";
import { EditUserModal } from "@/components/admin/users/EditUserModal";
import { GuardiansPanel } from "@/components/admin/guardians/GuardiansPanel";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminTabs, AdminMessage } from "@/components/admin/ui";

type UserAccountAction =
  | "send_invite"
  | "deactivate"
  | "activate"
  | "reset_password"
  | "hard_delete_student"
  | "promote_student_to_faculty";

const ACTION_CONFIRM: Record<
  UserAccountAction,
  { title: string; description: (user: ManagedUser) => string; confirmLabel: string; danger?: boolean }
> = {
  send_invite: {
    title: "Send invite",
    description: (u) =>
      `Send a sign-in invite to ${u.name} at ${u.email}? The link expires in 7 days and can be used once.`,
    confirmLabel: "Send invite",
  },
  deactivate: {
    title: "Deactivate account",
    description: (u) =>
      `Deactivate ${u.name}? They will lose access on their next sign-in or API request.`,
    confirmLabel: "Deactivate",
    danger: true,
  },
  activate: {
    title: "Activate account",
    description: (u) => `Reactivate ${u.name}? They will regain access to their portal.`,
    confirmLabel: "Activate",
  },
  reset_password: {
    title: "Reset password",
    description: (u) =>
      `Reset the password for ${u.name}? Existing sessions will be invalidated and a temporary password will be shown.`,
    confirmLabel: "Reset password",
    danger: true,
  },
  hard_delete_student: {
    title: "Delete student",
    description: (u) =>
      `Permanently delete ${u.name}? This cannot be undone and is blocked if they have open fee dues.`,
    confirmLabel: "Delete permanently",
    danger: true,
  },
  promote_student_to_faculty: {
    title: "Promote to faculty",
    description: (u) =>
      `Create a linked faculty account for ${u.name}? The student account will be deactivated and archived.`,
    confirmLabel: "Promote",
  },
};

const ROLE_FILTERS: { id: "all" | AssignableRole; label: string }[] = [
  { id: "all", label: "All" },
  { id: "admin", label: "Admin" },
  { id: "faculty", label: "Faculty" },
  { id: "student", label: "Student" },
  { id: "parent", label: "Parent" },
];

const ROLE_CHIP_COLOR: Record<AssignableRole, string> = {
  admin: "#805ad5",
  faculty: "#3182ce",
  student: "#38a169",
  parent: "#d69e2e",
};

function idemHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    "Idempotency-Key": `users-${Date.now()}`,
  };
}

export type PeopleManagementConfig = {
  scope: "admin" | "super_admin";
  usersApiBase: string;
  usersActionsApiBase: string;
  guardiansApiBase?: string;
  branchOptions?: { id: string; name: string }[];
  initialBranch?: string;
  initialRole?: "all" | AssignableRole;
  showBranchColumn?: boolean;
  requireBranchOnCreate?: boolean;
};

type PeopleTab = "accounts" | "guardians";

export function PeopleManagementPanel({ config }: { config: PeopleManagementConfig }) {
  const [tab, setTab] = useState<PeopleTab>("accounts");
  const [message, setMessage] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [resetResult, setResetResult] = useState<{ name: string; password: string } | null>(null);
  const [pendingAction, setPendingAction] = useState<{
    action: UserAccountAction;
    user: ManagedUser;
  } | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [page, setPage] = useState(1);
  const [editUser, setEditUser] = useState<ManagedUser | null>(null);
  const [branchFilter, setBranchFilter] = useState(config.initialBranch ?? "all");
  const [roleFilter, setRoleFilter] = useState<"all" | AssignableRole>(config.initialRole ?? "all");

  // Role/search/branch are all enforced server-side — reset to page 1 whenever any of
  // them change, so the user doesn't land on a now-out-of-range page. Done during render
  // (not a useEffect) so `page` is already correct by the time `usersUrl` below is
  // computed in this same render — an effect-based reset lags one render behind, which
  // briefly requests the old (now out-of-range) page with the new filter and 404s.
  const filterKey = `${branchFilter}|${roleFilter}|${debouncedSearch}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setPage(1);
  }

  const usersUrl = useMemo(() => {
    const qs = new URLSearchParams();
    qs.set("page", String(page));
    qs.set("page_size", "20");
    if (roleFilter !== "all") qs.set("role", roleFilter);
    if (debouncedSearch.trim()) qs.set("search", debouncedSearch.trim());
    if (config.scope === "super_admin") {
      qs.set("branch", branchFilter === "all" ? "all" : branchFilter);
    }
    return `${config.usersApiBase}?${qs.toString()}`;
  }, [config.scope, config.usersApiBase, branchFilter, roleFilter, debouncedSearch, page]);

  const { data, isLoading, refetch } = useUserManagementQuery(usersUrl);
  const load = refetch;

  // Platform license status per student user (one license = one student, forever).
  const [licenseFilter, setLicenseFilter] = useState<"all" | "licensed" | "unlicensed">("all");
  const { data: licenseRows } = useLicensingStudentsQuery(
    config.scope === "super_admin" ? "super-admin" : "admin",
  );
  const licenseByUserId = useMemo(() => {
    const map = new Map<string, "licensed" | "unlicensed">();
    for (const row of licenseRows ?? []) {
      if (row.studentUserId) map.set(row.studentUserId, row.licenseStatus);
    }
    return map;
  }, [licenseRows]);

  async function executeUserAction(action: UserAccountAction, user: ManagedUser) {
    if (action === "reset_password") {
      const result = await userAction(action, user.id);
      if (result?.temporary_password) {
        setResetResult({ name: user.name, password: result.temporary_password });
        setMessage(`Password reset for ${user.name}. User must sign in again.`);
      }
      return;
    }

    const result = await userAction(action, user.id);
    if (action === "send_invite" && result) {
      setMessage(`Invite sent to ${user.email} (expires in 7 days).`);
    }
    if (action === "deactivate") {
      setMessage(`${user.name} deactivated — their next API call will return 401.`);
    }
    if (action === "activate") {
      setMessage(`${user.name} reactivated.`);
    }
    if (action === "hard_delete_student" && result?.id) {
      setMessage(`${user.name} permanently deleted.`);
    }
    if (action === "promote_student_to_faculty" && result) {
      const faculty = (result as { faculty?: ManagedUser }).faculty;
      setMessage(
        faculty
          ? `${user.name} promoted — faculty account ${faculty.name} created and linked.`
          : `${user.name} promoted to faculty.`,
      );
    }
  }

  async function confirmPendingAction() {
    if (!pendingAction) return;
    setActionBusy(true);
    await executeUserAction(pendingAction.action, pendingAction.user);
    setActionBusy(false);
    setPendingAction(null);
  }

  async function userAction(action: string, userId: string) {
    const res = await fetch(config.usersActionsApiBase, {
      method: "PATCH",
      credentials: "include",
      headers: idemHeaders(),
      body: JSON.stringify({ action, userId }),
    });
    const body = await res.json();
    if (!res.ok) {
      setMessage(body.error ?? "Action failed");
      return null;
    }
    await load();
    return body;
  }

  const allUsers = data?.users.results ?? [];
  const users =
    licenseFilter === "all"
      ? allUsers
      : allUsers.filter(
          (u) => u.role !== "student" || (licenseByUserId.get(u.id) ?? "unlicensed") === licenseFilter,
        );
  const totalUsers = data?.users.count ?? 0;

  const showBranchCol = config.showBranchColumn && branchFilter === "all";

  const columns = useMemo<DataTableColumn<ManagedUser>[]>(() => {
    const cols: DataTableColumn<ManagedUser>[] = [
      {
        key: "name",
        label: "Name",
        render: (u) => (
          <>
            <div style={{ fontWeight: 600 }}>{u.name}</div>
            {u.linked_user_group_id ? (
              <div style={{ fontSize: "0.7rem", color: "var(--eduos-text-muted)" }}>
                Linked: {u.linked_user_group_id}
              </div>
            ) : null}
          </>
        ),
      },
    ];
    if (showBranchCol) {
      cols.push({ key: "branch", label: "Branch", render: (u) => u.branch ?? "—" });
    }
    cols.push(
      {
        key: "role",
        label: "Role",
        render: (u) => (
          <span
            style={{
              display: "inline-block",
              padding: "0.15rem 0.5rem",
              borderRadius: "999px",
              fontSize: "0.7rem",
              fontWeight: 600,
              color: "#fff",
              background: ROLE_CHIP_COLOR[u.role],
              textTransform: "capitalize",
            }}
          >
            {u.role}
          </span>
        ),
      },
      {
        key: "contact",
        label: "Contact",
        render: (u) => (
          <>
            {u.email}
            <br />
            {u.phone ?? "—"}
          </>
        ),
      },
      {
        key: "status",
        label: "Status",
        render: (u) =>
          !u.is_active ? (
            <span style={{ color: "var(--eduos-danger)" }}>Inactive</span>
          ) : u.invite_status === "pending" ? (
            <span style={{ color: "#d69e2e" }}>Invite pending</span>
          ) : u.password_reset_required ? (
            <span style={{ color: "#d69e2e" }}>Reset required</span>
          ) : (
            <span style={{ color: "var(--eduos-primary)" }}>Active</span>
          ),
      },
      {
        key: "license",
        label: "License",
        render: (u) => {
          if (u.role !== "student") return <>—</>;
          const status = licenseByUserId.get(u.id);
          if (!status) return <>—</>;
          return status === "licensed" ? (
            <span style={{ color: "var(--eduos-primary)", fontWeight: 600 }}>Licensed</span>
          ) : (
            <span style={{ color: "var(--eduos-danger)", fontWeight: 600 }}>Unpaid</span>
          );
        },
      },
      {
        key: "actions",
        label: "Actions",
        render: (u) => (
          <UserRowActions
            user={u}
            onAction={(action) => setPendingAction({ action, user: u })}
            onEdit={() => setEditUser(u)}
          />
        ),
      },
    );
    return cols;
  }, [showBranchCol, licenseByUserId]);

  return (
    <>
      <AdminTabs
        tabs={[
          { id: "accounts", label: "User accounts" },
          { id: "guardians", label: "Guardian links" },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === "guardians" ? (
        <GuardiansPanel
          apiBase={config.guardiansApiBase ?? "/api/admin/guardians"}
          readOnly={config.scope === "super_admin"}
          branches={config.scope === "super_admin" ? config.branchOptions : undefined}
        />
      ) : null}

      {tab === "accounts" ? (
        <>
          {config.scope === "admin" && data?.branchName ? (
            <p style={{ fontSize: "0.8125rem", color: "var(--eduos-text-muted)", marginBottom: "1rem" }}>
              Your campus: <strong>{data.branchName}</strong> — user accounts are limited to this branch.
            </p>
          ) : null}
          {config.scope === "super_admin" ? (
            <div
              className="eduos-portal-toolbar"
              style={{
                position: "sticky",
                top: 0,
                zIndex: 2,
                background: "var(--eduos-bg)",
                padding: "0.5rem 0",
                marginBottom: "0.75rem",
                flexWrap: "wrap",
                gap: "0.5rem",
              }}
            >
              <label style={{ fontSize: "0.8125rem" }}>
                Branch
                <select
                  className="eduos-input eduos-input--field"
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                  style={{ display: "block", marginTop: "0.2rem", minWidth: "10rem" }}
                >
                  <option value="all">All branches</option>
                  {(config.branchOptions ?? []).map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", alignItems: "flex-end" }}>
                {ROLE_FILTERS.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRoleFilter(r.id)}
                    style={{
                      padding: "0.35rem 0.65rem",
                      borderRadius: "999px",
                      border: "1px solid var(--eduos-border)",
                      background: roleFilter === r.id ? "var(--eduos-primary-light)" : "transparent",
                      fontSize: "0.75rem",
                      fontWeight: roleFilter === r.id ? 700 : 500,
                      cursor: "pointer",
                    }}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <p style={{ fontSize: "0.875rem", color: "var(--eduos-text-muted)", marginBottom: "1rem" }}>
            {data?.multi_role_policy}
          </p>

          <AdminMessage>{message}</AdminMessage>

          <section className="eduos-panel">
            <div className="eduos-admin-toolbar" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: "0.8125rem" }}>
                License
                <select
                  className="eduos-input eduos-input--field"
                  value={licenseFilter}
                  onChange={(e) => setLicenseFilter(e.target.value as typeof licenseFilter)}
                  style={{ display: "block", marginTop: "0.2rem", minWidth: "9rem" }}
                >
                  <option value="all">All</option>
                  <option value="licensed">Licensed students</option>
                  <option value="unlicensed">Unpaid students</option>
                </select>
              </label>
              <Button type="button" onClick={() => setShowAdd(true)} className="eduos-admin-btn-sm">
                Add user
              </Button>
            </div>
          </section>

          {(data?.pending_invites.length ?? 0) > 0 ? (
            <section className="eduos-panel" style={{ marginBottom: "1rem" }}>
              <h2 className="eduos-section-title">Pending invites</h2>
              <table className="eduos-admin-table" style={{ marginTop: "0.75rem" }}>
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Sent</th>
                    <th>Expires</th>
                  </tr>
                </thead>
                <tbody>
                  {data!.pending_invites.map((inv) => (
                    <tr key={inv.id}>
                      <td>
                        {inv.name || inv.email}
                        <div style={{ fontSize: "0.75rem", color: "var(--eduos-text-muted)" }}>
                          {inv.email}
                        </div>
                      </td>
                      <td>{new Date(inv.created_at).toLocaleDateString()}</td>
                      <td>{new Date(inv.expires_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ) : null}

          <div className="eduos-panel">
            {!data && !isLoading ? null : !data && search === "" && roleFilter === "all" && totalUsers === 0 ? (
              <EmptyState
                title="No user accounts yet"
                description="Add your first admin, faculty, student, or parent account to get started."
                action={
                  <Button type="button" onClick={() => setShowAdd(true)}>
                    Add user
                  </Button>
                }
              />
            ) : (
              <DataTable<ManagedUser>
                columns={columns}
                rows={users}
                rowKey={(u) => u.id}
                loading={isLoading}
                page={page}
                pageSize={20}
                totalCount={totalUsers}
                onPageChange={setPage}
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search name, email, phone, or role…"
                emptyTitle={search || roleFilter !== "all" ? "No matches" : "No user accounts yet"}
                emptyDescription={
                  search || roleFilter !== "all"
                    ? "Try a different name, email, phone, or role."
                    : "Add your first admin, faculty, student, or parent account to get started."
                }
                emptyAction={
                  !search && roleFilter === "all" ? (
                    <Button type="button" onClick={() => setShowAdd(true)}>
                      Add user
                    </Button>
                  ) : undefined
                }
              />
            )}
          </div>

          {pendingAction ? (
            <AdminModal
              title={ACTION_CONFIRM[pendingAction.action].title}
              onClose={() => {
                if (!actionBusy) setPendingAction(null);
              }}
            >
              <p className="eduos-section-desc" style={{ margin: 0 }}>
                {ACTION_CONFIRM[pendingAction.action].description(pendingAction.user)}
              </p>
              <div
                style={{
                  marginTop: "1.25rem",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "0.5rem",
                }}
              >
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setPendingAction(null)}
                  disabled={actionBusy}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={confirmPendingAction}
                  disabled={actionBusy}
                  style={
                    ACTION_CONFIRM[pendingAction.action].danger
                      ? { background: "var(--eduos-danger)", borderColor: "var(--eduos-danger)" }
                      : undefined
                  }
                >
                  {actionBusy ? "Working…" : ACTION_CONFIRM[pendingAction.action].confirmLabel}
                </Button>
              </div>
            </AdminModal>
          ) : null}

          {showAdd ? (
            <AddUserWizardModal
              apiBase={config.usersApiBase}
              checkMultiRoleApiBase={`${config.usersApiBase}/check-multi-role`}
              branches={config.branchOptions}
              requireBranch={config.requireBranchOnCreate}
              defaultBranchId={branchFilter !== "all" ? branchFilter : config.branchOptions?.[0]?.id}
              onClose={() => setShowAdd(false)}
              onCreated={(msg) => {
                setMessage(msg);
                load();
              }}
            />
          ) : null}

          {editUser ? (
            <EditUserModal
              user={editUser}
              actionsApiBase={config.usersActionsApiBase}
              onClose={() => setEditUser(null)}
              onSaved={(msg) => {
                setMessage(msg);
                load();
              }}
            />
          ) : null}

          {resetResult ? (
            <div
              className="eduos-panel"
              style={{
                marginTop: "1rem",
                background: "var(--eduos-primary-light)",
              }}
            >
              <strong>Temporary password for {resetResult.name}</strong>
              <p style={{ fontFamily: "monospace", margin: "0.5rem 0" }}>{resetResult.password}</p>
              <p style={{ fontSize: "0.75rem", color: "var(--eduos-text-muted)" }}>
                Share securely. Existing sessions were invalidated.
              </p>
              <Button type="button" variant="secondary" onClick={() => setResetResult(null)}>
                Dismiss
              </Button>
            </div>
          ) : null}
        </>
      ) : null}
    </>
  );
}

function UserRowActions({
  user,
  onAction,
  onEdit,
}: {
  user: ManagedUser;
  onAction: (action: UserAccountAction) => void;
  onEdit: () => void;
}) {
  const linkBtn: React.CSSProperties = {
    background: "none",
    border: "none",
    padding: "0 0.5rem 0 0",
    fontSize: "0.75rem",
    color: "var(--eduos-primary)",
    cursor: "pointer",
    textDecoration: "underline",
  };

  return (
    <>
      <button type="button" style={linkBtn} onClick={onEdit}>
        Edit
      </button>
      <button type="button" style={linkBtn} onClick={() => onAction("send_invite")}>
        Invite
      </button>
      {user.is_active ? (
        <button type="button" style={linkBtn} onClick={() => onAction("deactivate")}>
          Deactivate
        </button>
      ) : (
        <button type="button" style={linkBtn} onClick={() => onAction("activate")}>
          Activate
        </button>
      )}
      <button type="button" style={linkBtn} onClick={() => onAction("reset_password")}>
        Reset password
      </button>
      {user.role === "student" ? (
        <>
          <button type="button" style={linkBtn} onClick={() => onAction("promote_student_to_faculty")}>
            Promote
          </button>
          <button
            type="button"
            style={{ ...linkBtn, color: "var(--eduos-danger)" }}
            onClick={() => onAction("hard_delete_student")}
          >
            Delete
          </button>
        </>
      ) : null}
    </>
  );
}
