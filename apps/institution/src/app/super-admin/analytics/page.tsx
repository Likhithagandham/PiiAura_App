"use client";

import { useEffect } from "react";
import type { SuperAdminBranchKpi } from "@eduos/types";
import { ChartLegend, DonutChart, SkeletonTable, TruncatedText } from "@eduos/ui";
import { SuperAdminShell } from "@/components/super-admin/SuperAdminShell";
import { useSuperAdminDashboardQuery } from "@/lib/queries";

function attendanceColor(pct: number): string {
  return pct >= 85 ? "#1a5f4a" : pct >= 75 ? "#d69e2e" : "#c53030";
}

function presentAbsentSlices(pct: number) {
  const present = Math.max(0, Math.min(100, pct));
  return [
    { label: "Present", value: present, color: attendanceColor(present) },
    { label: "Absent", value: 100 - present, color: "var(--eduos-border)" },
  ];
}

function BranchAttendanceDonutGrid({
  kpis,
  getPercent,
  caption,
}: {
  kpis: SuperAdminBranchKpi[];
  getPercent: (k: SuperAdminBranchKpi) => number;
  caption: string;
}) {
  if (kpis.length === 0) return null;

  return (
    <div style={{ marginTop: "0.75rem", marginBottom: "1.25rem" }}>
      <h3 className="eduos-subsection-title" style={{ marginBottom: "0.35rem" }}>
        {caption}
      </h3>
      <p className="eduos-section-desc" style={{ marginBottom: "0.75rem" }}>
        Present vs absent by campus (current month).
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(11rem, 1fr))",
          gap: "1.25rem",
          alignItems: "start",
        }}
      >
        {kpis.map((k) => {
          const pct = getPercent(k);
          const slices = presentAbsentSlices(pct);
          return (
            <div key={k.branchId} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
              <DonutChart
                data={slices}
                size={148}
                thickness={18}
                centerValue={`${pct}%`}
                centerLabel={<TruncatedText text={k.branchName} maxWidth="6.5rem" />}
              />
              <ChartLegend
                items={[
                  { label: "Present", color: slices[0]!.color!, value: `${pct}%` },
                  { label: "Absent", color: slices[1]!.color!, value: `${100 - pct}%` },
                ]}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function pctBar(pct: number) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div
      style={{
        width: 120,
        height: 8,
        borderRadius: 999,
        border: "1px solid var(--eduos-border)",
        background: "var(--eduos-card)",
        overflow: "hidden",
      }}
      aria-hidden
    >
      <div
        style={{
          width: `${clamped}%`,
          height: "100%",
          background: clamped >= 85 ? "#1a5f4a" : clamped >= 75 ? "#d69e2e" : "#c53030",
        }}
      />
    </div>
  );
}

export default function SuperAdminAnalyticsPage() {
  // Legacy route: keep working, but prefer the merged Insights module.
  useEffect(() => {
    window.location.replace("/super-admin/insights?tab=analytics");
  }, []);
  return <p className="eduos-empty">Redirecting…</p>;
}

export function SuperAdminAnalyticsView({ embedded = false }: { embedded?: boolean }) {
  const { data, error: queryError } = useSuperAdminDashboardQuery();
  const error = queryError ? (queryError instanceof Error ? queryError.message : "Failed to load") : null;

  const body = (
    <>
      {error ? <p className="eduos-admin-message eduos-admin-message--error">{error}</p> : null}
      {!data ? (
        <SkeletonTable columns={6} rows={5} />
      ) : (
        <section className="eduos-panel">
          <h2 className="eduos-section-title">Cross-branch analytics</h2>
          <p className="eduos-section-desc">Compare KPIs across branches.</p>
          {data.branchKpis.length > 0 ? (
            <>
              <BranchAttendanceDonutGrid
                kpis={data.branchKpis}
                getPercent={(k) => k.attendancePercent}
                caption="Student attendance by campus"
              />
              <BranchAttendanceDonutGrid
                kpis={data.branchKpis}
                getPercent={(k) => k.facultyAttendancePercent ?? 0}
                caption="Faculty attendance by campus"
              />
            </>
          ) : null}
          <div className="eduos-table-wrap" style={{ marginTop: "0.5rem" }}>
            <table className="eduos-admin-table">
              <thead>
                <tr>
                  <th>Branch</th>
                  <th className="eduos-admin-table__nowrap">Students</th>
                  <th className="eduos-admin-table__nowrap">Faculty</th>
                  <th className="eduos-admin-table__nowrap">Student att.</th>
                  <th className="eduos-admin-table__nowrap">Faculty att.</th>
                  <th className="eduos-admin-table__nowrap">Fee due</th>
                </tr>
              </thead>
              <tbody>
                {data.branchKpis.map((k) => (
                  <tr key={k.branchId}>
                    <td style={{ fontWeight: 700 }}>
                      <TruncatedText text={k.branchName} maxWidth="16rem" />
                    </td>
                    <td>{k.students}</td>
                    <td>{k.faculty}</td>
                    <td className="eduos-admin-table__nowrap">
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        {pctBar(k.attendancePercent)}
                        <span style={{ fontSize: "0.8125rem" }}>{k.attendancePercent}%</span>
                      </div>
                    </td>
                    <td className="eduos-admin-table__nowrap">
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        {pctBar(k.facultyAttendancePercent ?? 0)}
                        <span style={{ fontSize: "0.8125rem" }}>{k.facultyAttendancePercent ?? 0}%</span>
                      </div>
                    </td>
                    <td>₹{k.feeDue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );

  if (embedded) return body;
  return <SuperAdminShell title="Analytics">{body}</SuperAdminShell>;
}

