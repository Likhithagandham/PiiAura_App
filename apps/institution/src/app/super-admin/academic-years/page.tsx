"use client";

import { useEffect, useMemo } from "react";
import type { SuperAdminAcademicYearOverviewData, SuperAdminAcademicYearStatus } from "@eduos/types";
import { EmptyState, SkeletonTable, TruncatedText } from "@eduos/ui";
import { SuperAdminShell } from "@/components/super-admin/SuperAdminShell";
import { useApiData } from "@/lib/queries";

function statusLabel(s: SuperAdminAcademicYearStatus): string {
  if (s === "in_progress") return "In progress";
  if (s === "upcoming") return "Upcoming";
  return "Ended";
}

function statusTagStyle(s: SuperAdminAcademicYearStatus): React.CSSProperties {
  if (s === "in_progress") return { background: "rgba(34, 197, 94, 0.12)", borderColor: "rgba(34, 197, 94, 0.35)" };
  if (s === "upcoming") return { background: "rgba(59, 130, 246, 0.12)", borderColor: "rgba(59, 130, 246, 0.35)" };
  return { background: "rgba(148, 163, 184, 0.14)", borderColor: "rgba(148, 163, 184, 0.35)" };
}

export default function SuperAdminAcademicYearsPage() {
  // Legacy route: keep working, but prefer the merged Operations module.
  useEffect(() => {
    window.location.replace("/super-admin/operations?tab=academicYears");
  }, []);
  return <p className="eduos-empty">Redirecting…</p>;
}

export function SuperAdminAcademicYearsView({ embedded = false }: { embedded?: boolean }) {
  const { data, error: queryError } = useApiData<SuperAdminAcademicYearOverviewData>(
    "/api/super-admin/academic-years",
  );
  const error = queryError ? (queryError instanceof Error ? queryError.message : "Failed to load") : null;

  const totals = useMemo(() => {
    const rows = data?.rows ?? [];
    const inProgress = rows.filter((r) => r.status === "in_progress").length;
    const upcoming = rows.filter((r) => r.status === "upcoming").length;
    const ended = rows.filter((r) => r.status === "ended").length;
    return { inProgress, upcoming, ended, total: rows.length };
  }, [data]);

  const body = (
    <>
      {error ? <p className="eduos-admin-message eduos-admin-message--error">{error}</p> : null}
      {!data ? (
        <SkeletonTable columns={7} rows={5} />
      ) : (
        <>
          <section className="eduos-panel">
            <h2 className="eduos-section-title">Overview</h2>
            <p className="eduos-section-desc">Current academic year status per branch.</p>
            <div className="eduos-portal-toolbar" style={{ marginTop: "0.5rem", alignItems: "center" }}>
              <span className="eduos-tag">Branches: {totals.total}</span>
              <span className="eduos-tag" style={statusTagStyle("in_progress")}>
                In progress: {totals.inProgress}
              </span>
              <span className="eduos-tag" style={statusTagStyle("upcoming")}>
                Upcoming: {totals.upcoming}
              </span>
              <span className="eduos-tag" style={statusTagStyle("ended")}>
                Ended: {totals.ended}
              </span>
            </div>
          </section>

          <section className="eduos-panel">
            <h2 className="eduos-section-title">Branches</h2>
            {data.rows.length === 0 ? (
              <EmptyState title="No active branches" description="No active branches to show academic year status." />
            ) : (
              <div className="eduos-table-wrap">
                <table className="eduos-admin-table">
                  <thead>
                    <tr>
                      <th>Branch</th>
                      <th className="eduos-admin-table__nowrap">Academic year</th>
                      <th className="eduos-admin-table__nowrap">Start</th>
                      <th className="eduos-admin-table__nowrap">End</th>
                      <th className="eduos-admin-table__nowrap">Status</th>
                      <th className="eduos-admin-table__nowrap">Progress</th>
                      <th className="eduos-admin-table__nowrap">Days left</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.rows.map((r) => (
                      <tr key={r.branchId}>
                        <td style={{ fontWeight: 700 }}>
                          <TruncatedText text={r.branchName} maxWidth="16rem" />
                        </td>
                        <td>{r.academicYearLabel}</td>
                        <td>{r.startDate}</td>
                        <td>{r.endDate}</td>
                        <td>
                          <span className="eduos-tag" style={{ textTransform: "capitalize", ...statusTagStyle(r.status) }}>
                            {statusLabel(r.status)}
                          </span>
                        </td>
                        <td>{r.percentElapsed}%</td>
                        <td>{r.daysRemaining == null ? "—" : r.daysRemaining}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </>
  );

  if (embedded) return body;
  return <SuperAdminShell title="Academic years">{body}</SuperAdminShell>;
}

