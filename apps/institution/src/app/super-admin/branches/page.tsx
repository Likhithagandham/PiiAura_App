"use client";

import { useEffect, useMemo, useState } from "react";
import type { SuperAdminBranch, SuperAdminCreateBranchInput } from "@eduos/types";
import { Button, ListSearchBar, SkeletonTable, TruncatedText, filterBySearch } from "@eduos/ui";
import { SuperAdminShell } from "@/components/super-admin/SuperAdminShell";
import { apiSend } from "@/lib/api-client";
import { useSuperAdminBranchesQuery } from "@/lib/queries";

export default function SuperAdminBranchesPage() {
  // Legacy route: keep working, but prefer the merged Operations module.
  useEffect(() => {
    window.location.replace("/super-admin/operations?tab=branches");
  }, []);
  return <p className="eduos-empty">Redirecting…</p>;
}

export function SuperAdminBranchesView({ embedded = false }: { embedded?: boolean }) {
  const { data, error: loadError, refetch } = useSuperAdminBranchesQuery();
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<SuperAdminCreateBranchInput>({ name: "", code: "", city: "" });
  const [search, setSearch] = useState("");

  const displayError = error ?? (loadError ? "Failed to load" : null);

  const filteredBranches = useMemo(
    () =>
      filterBySearch(data?.branches ?? [], search, (b) => [b.name, b.code, b.city]),
    [data?.branches, search],
  );

  async function createBranch() {
    setCreating(true);
    setError(null);
    try {
      await apiSend("/api/super-admin/branches", "POST", form);
      setForm({ name: "", code: "", city: "" });
      await refetch();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create branch");
    } finally {
      setCreating(false);
    }
  }

  async function setActive(branch: SuperAdminBranch, isActive: boolean) {
    setError(null);
    try {
      await apiSend("/api/super-admin/branches/actions", "PATCH", {
        action: "set_active",
        branchId: branch.id,
        isActive,
      });
      await refetch();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update");
    }
  }

  const body = (
    <>
      {displayError ? <p className="eduos-admin-message eduos-admin-message--error">{displayError}</p> : null}

      <section className="eduos-panel">
        <h2 className="eduos-section-title">Create branch</h2>
        <div className="eduos-portal-toolbar" style={{ marginTop: "0.5rem" }}>
          <label style={{ fontSize: "0.8125rem" }}>
            Name
            <input
              className="eduos-input eduos-input--field"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Central Campus"
              style={{ display: "block", marginTop: "0.2rem" }}
            />
          </label>
          <label style={{ fontSize: "0.8125rem" }}>
            Code
            <input
              className="eduos-input eduos-input--field"
              value={form.code}
              onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
              placeholder="e.g. CENT"
              style={{ display: "block", marginTop: "0.2rem" }}
            />
          </label>
          <label style={{ fontSize: "0.8125rem" }}>
            City
            <input
              className="eduos-input eduos-input--field"
              value={form.city}
              onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
              placeholder="e.g. Chennai"
              style={{ display: "block", marginTop: "0.2rem" }}
            />
          </label>
          <Button type="button" className="eduos-admin-btn-sm" onClick={createBranch} disabled={creating}>
            {creating ? "Creating…" : "Create"}
          </Button>
        </div>
        <p className="eduos-empty eduos-empty--sm" style={{ marginTop: "0.35rem" }}>
          Branches are used for consolidation, comparisons, and branch-admin scoping.
        </p>
      </section>

      <section className="eduos-panel">
        <h2 className="eduos-section-title">Branch management</h2>
        {!data ? (
          <SkeletonTable columns={5} rows={5} />
        ) : (
          <div className="eduos-table-wrap">
            <ListSearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search branch name, code, or city…"
              total={data.branches.length}
              filtered={filteredBranches.length}
            />
            <table className="eduos-admin-table">
              <thead>
                <tr>
                  <th>Branch</th>
                  <th className="eduos-admin-table__nowrap">Code</th>
                  <th>City</th>
                  <th className="eduos-admin-table__nowrap">Status</th>
                  <th className="eduos-admin-table__nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBranches.map((b) => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 700 }}>
                      <TruncatedText text={b.name} maxWidth="16rem" />
                    </td>
                    <td className="eduos-admin-table__nowrap">
                      <code>{b.code}</code>
                    </td>
                    <td>{b.city}</td>
                    <td>{b.isActive ? "Active" : "Inactive"}</td>
                    <td className="eduos-admin-table__actions">
                      {b.isActive ? (
                        <Button
                          type="button"
                          variant="secondary"
                          className="eduos-admin-btn-sm"
                          onClick={() => setActive(b, false)}
                        >
                          Deactivate
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          className="eduos-admin-btn-sm"
                          onClick={() => setActive(b, true)}
                        >
                          Activate
                        </Button>
                      )}
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
  return <SuperAdminShell title="Branches">{body}</SuperAdminShell>;
}
