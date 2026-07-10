"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  SuperAdminAdminsData,
  SuperAdminBranchAdminUser,
  SuperAdminInviteAdminInput,
} from "@eduos/types";
import { Button, EmptyState, ListSearchBar, SkeletonTable, TruncatedText, filterBySearch } from "@eduos/ui";
import { SuperAdminShell } from "@/components/super-admin/SuperAdminShell";
import { useApiData } from "@/lib/queries";

export default function SuperAdminAdminsPage() {
  // Legacy route: keep working, but prefer the merged Operations module.
  useEffect(() => {
    window.location.replace("/super-admin/operations?tab=people&role=admin");
  }, []);
  return <p className="eduos-empty">Redirecting…</p>;
}

export function SuperAdminAdminsView({ embedded = false }: { embedded?: boolean }) {
  const { data, error: queryError, refetch } = useApiData<SuperAdminAdminsData>(
    "/api/super-admin/admins",
  );
  const load = refetch;
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [branchDraft, setBranchDraft] = useState<Record<string, string>>({});
  const [form, setForm] = useState<SuperAdminInviteAdminInput>({
    name: "",
    phone: "",
    branchId: "",
  });
  const [search, setSearch] = useState("");

  const error = mutationError ?? (queryError ? "Failed to load" : null);
  const branchOptions = useMemo(() => data?.branches ?? [], [data]);
  // Invite form defaults to the first branch until the user picks one.
  const effectiveBranchId = form.branchId || branchOptions[0]?.id || "";

  const filteredAdmins = useMemo(() => {
    const branchNameById = new Map(branchOptions.map((b) => [b.id, b.name]));
    return filterBySearch(data?.admins ?? [], search, (a) => [
      a.name,
      a.phone,
      branchNameById.get(a.branchId),
    ]);
  }, [data?.admins, search, branchOptions]);

  async function invite() {
    setSaving(true);
    setMutationError(null);
    try {
      const res = await fetch("/api/super-admin/admins", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, branchId: effectiveBranchId }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as { error?: string }).error ?? "Failed to invite");
      setForm((p) => ({ ...p, name: "", phone: "" }));
      await load();
    } catch (e) {
      setMutationError(e instanceof Error ? e.message : "Failed to invite");
    } finally {
      setSaving(false);
    }
  }

  async function setActive(admin: SuperAdminBranchAdminUser, isActive: boolean) {
    setMutationError(null);
    const res = await fetch("/api/super-admin/admins/actions", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "set_active", adminId: admin.id, isActive }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMutationError((json as { error?: string }).error ?? "Failed to update");
      return;
    }
    await load();
  }

  async function setBranch(admin: SuperAdminBranchAdminUser, branchId: string) {
    setSaving(true);
    setMutationError(null);
    try {
      const res = await fetch("/api/super-admin/admins/actions", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set_branch", adminId: admin.id, branchId }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as { error?: string }).error ?? "Failed to reassign");
      await load();
    } catch (e) {
      setMutationError(e instanceof Error ? e.message : "Failed to reassign");
    } finally {
      setSaving(false);
    }
  }

  const body = (
    <>
      {error ? <p className="eduos-admin-message eduos-admin-message--error">{error}</p> : null}

      <section className="eduos-panel">
        <h2 className="eduos-section-title">Invite branch admin</h2>
        <p className="eduos-section-desc">Invite, deactivate, and manage branch admin access.</p>
        <div className="eduos-portal-toolbar" style={{ marginTop: "0.5rem" }}>
          <label style={{ fontSize: "0.8125rem" }}>
            Name
            <input
              className="eduos-input eduos-input--field"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Neha Singh"
              style={{ display: "block", marginTop: "0.2rem" }}
            />
          </label>
          <label style={{ fontSize: "0.8125rem" }}>
            Phone (E.164)
            <input
              className="eduos-input eduos-input--field"
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              placeholder="+9198765..."
              style={{ display: "block", marginTop: "0.2rem" }}
            />
          </label>
          <label style={{ fontSize: "0.8125rem" }}>
            Branch
            <select
              className="eduos-input eduos-input--field"
              value={effectiveBranchId}
              onChange={(e) => setForm((p) => ({ ...p, branchId: e.target.value }))}
              style={{ display: "block", marginTop: "0.2rem" }}
            >
              {branchOptions.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>
          <Button type="button" className="eduos-admin-btn-sm" onClick={invite} disabled={saving}>
            {saving ? "Inviting…" : "Invite"}
          </Button>
        </div>
      </section>

      <section className="eduos-panel">
        <h2 className="eduos-section-title">Branch admins</h2>
        {!data ? (
          <SkeletonTable columns={6} rows={5} />
        ) : data.admins.length === 0 ? (
          <EmptyState title="No admins" description="No branch admins have been invited yet." />
        ) : (
          <div className="eduos-table-wrap">
            <ListSearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search name, phone, or branch…"
              total={data.admins.length}
              filtered={filteredAdmins.length}
            />
            <table className="eduos-admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th className="eduos-admin-table__nowrap">Phone</th>
                  <th>Branch</th>
                  <th className="eduos-admin-table__nowrap">Status</th>
                  <th className="eduos-admin-table__nowrap">Last login</th>
                  <th className="eduos-admin-table__nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdmins.map((a) => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 700 }}>
                      <TruncatedText text={a.name} maxWidth="16rem" />
                    </td>
                    <td className="eduos-admin-table__nowrap">{a.phone}</td>
                    <td>
                      <div className="eduos-portal-toolbar" style={{ gap: "0.5rem" }}>
                        <select
                          className="eduos-input eduos-input--field"
                          value={branchDraft[a.id] ?? a.branchId}
                          onChange={(e) => setBranchDraft((p) => ({ ...p, [a.id]: e.target.value }))}
                        >
                          {branchOptions.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name}
                            </option>
                          ))}
                        </select>
                        <Button
                          type="button"
                          variant="secondary"
                          className="eduos-admin-btn-sm"
                          onClick={() => setBranch(a, branchDraft[a.id] ?? a.branchId)}
                          disabled={saving || (branchDraft[a.id] ?? a.branchId) === a.branchId}
                        >
                          Reassign
                        </Button>
                      </div>
                    </td>
                    <td>{a.isActive ? "Active" : "Inactive"}</td>
                    <td className="eduos-admin-table__nowrap">
                      {a.lastLoginAt ? new Date(a.lastLoginAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="eduos-admin-table__actions">
                      <div className="eduos-portal-toolbar">
                        {a.isActive ? (
                          <Button
                            type="button"
                            variant="secondary"
                            className="eduos-admin-btn-sm"
                            onClick={() => setActive(a, false)}
                            disabled={saving}
                          >
                            Deactivate
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            className="eduos-admin-btn-sm"
                            onClick={() => setActive(a, true)}
                            disabled={saving}
                          >
                            Activate
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );

  if (embedded) return body;
  return <SuperAdminShell title="Admin users">{body}</SuperAdminShell>;
}

