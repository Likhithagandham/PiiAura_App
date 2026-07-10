"use client";

import { useEffect, useMemo, useState } from "react";
import type { SuperAdminExportJob, SuperAdminExportsData } from "@eduos/types";
import { Button, EmptyState, SkeletonTable } from "@eduos/ui";
import { SuperAdminShell } from "@/components/super-admin/SuperAdminShell";
import { apiSend } from "@/lib/api-client";
import { useApiData } from "@/lib/queries";

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function statusTagStyle(status: SuperAdminExportJob["status"]): React.CSSProperties {
  if (status === "completed") return { background: "rgba(34, 197, 94, 0.12)", borderColor: "rgba(34, 197, 94, 0.35)" };
  if (status === "running") return { background: "rgba(59, 130, 246, 0.12)", borderColor: "rgba(59, 130, 246, 0.35)" };
  if (status === "queued") return { background: "rgba(148, 163, 184, 0.14)", borderColor: "rgba(148, 163, 184, 0.35)" };
  return { background: "rgba(239, 68, 68, 0.12)", borderColor: "rgba(239, 68, 68, 0.35)" };
}

export function SuperAdminExportsView({ embedded = false }: { embedded?: boolean }) {
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const { data, error: queryError, refetch } = useApiData<SuperAdminExportsData>(
    "/api/super-admin/exports",
    {
      // Poll only while a job is queued/running (instead of unconditionally every 1.5s).
      refetchInterval: (query) => {
        const jobs = query.state.data?.jobs ?? [];
        return jobs.some((j) => j.status === "queued" || j.status === "running") ? 1500 : false;
      },
    },
  );
  const error = createError ?? (queryError ? (queryError instanceof Error ? queryError.message : "Failed to load") : null);

  const hasRunning = useMemo(
    () => Boolean((data?.jobs ?? []).some((j) => j.status === "queued" || j.status === "running")),
    [data],
  );

  async function startBranchSummaryExport() {
    setCreating(true);
    setCreateError(null);
    try {
      await apiSend<unknown>("/api/super-admin/exports", "POST", { type: "branch_summary" });
      await refetch();
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "Failed to start export");
    } finally {
      setCreating(false);
    }
  }

  const body = (
    <>
      {error ? <p className="eduos-admin-message eduos-admin-message--error">{error}</p> : null}

      <section className="eduos-panel">
        <h2 className="eduos-section-title">Branch summary export</h2>
        <p className="eduos-section-desc">Large cross-branch export generated as a background job.</p>
        <div className="eduos-portal-toolbar" style={{ marginTop: "0.5rem" }}>
          <Button
            type="button"
            className="eduos-admin-btn-sm"
            onClick={startBranchSummaryExport}
            disabled={creating || hasRunning}
          >
            {creating ? "Starting…" : hasRunning ? "Export running…" : "Start export"}
          </Button>
          <Button type="button" variant="secondary" className="eduos-admin-btn-sm" onClick={() => void refetch()} disabled={creating}>
            Refresh
          </Button>
        </div>
      </section>

      <section className="eduos-panel">
        <h2 className="eduos-section-title">Jobs</h2>
        {!data ? (
          <SkeletonTable columns={7} rows={5} />
        ) : data.jobs.length === 0 ? (
          <EmptyState title="No export jobs yet" description="Start an export to generate a downloadable file." />
        ) : (
          <div className="eduos-table-wrap">
            <table className="eduos-admin-table">
              <thead>
                <tr>
                  <th className="eduos-admin-table__nowrap">Job</th>
                  <th className="eduos-admin-table__nowrap">Type</th>
                  <th className="eduos-admin-table__nowrap">Status</th>
                  <th className="eduos-admin-table__nowrap">Progress</th>
                  <th className="eduos-admin-table__nowrap">Created</th>
                  <th className="eduos-admin-table__nowrap">Updated</th>
                  <th className="eduos-admin-table__nowrap">Download</th>
                </tr>
              </thead>
              <tbody>
                {data.jobs.map((j) => (
                  <tr key={j.id}>
                    <td style={{ fontWeight: 800 }}>{j.id}</td>
                    <td className="eduos-admin-table__nowrap">{j.type.replaceAll("_", " ")}</td>
                    <td>
                      <span className="eduos-tag" style={{ ...statusTagStyle(j.status), textTransform: "capitalize" }}>
                        {j.status.replaceAll("_", " ")}
                      </span>
                      {j.error ? (
                        <div style={{ fontSize: "0.75rem", color: "var(--eduos-danger)", marginTop: "0.2rem" }}>
                          {j.error}
                        </div>
                      ) : null}
                    </td>
                    <td className="eduos-admin-table__nowrap">{j.progressPercent}%</td>
                    <td className="eduos-admin-table__nowrap">{formatDateTime(j.createdAt)}</td>
                    <td className="eduos-admin-table__nowrap">{formatDateTime(j.updatedAt)}</td>
                    <td className="eduos-admin-table__nowrap">
                      {j.downloadUrl ? (
                        <a href={j.downloadUrl} style={{ fontWeight: 700 }}>
                          Download CSV
                        </a>
                      ) : (
                        "—"
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
  return <SuperAdminShell title="Exports">{body}</SuperAdminShell>;
}

export default function SuperAdminExportsPage() {
  // Legacy route: keep working, but prefer the merged Finance module.
  useEffect(() => {
    window.location.replace("/super-admin/finance?tab=exports");
  }, []);
  return <p className="eduos-empty">Redirecting…</p>;
}

