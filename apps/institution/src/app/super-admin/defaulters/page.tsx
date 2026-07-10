"use client";

import { useEffect, useMemo, useState } from "react";
import type { SuperAdminDefaulterReportData } from "@eduos/types";
import {
  BarChart,
  EmptyState,
  IconRupee,
  IconUsers,
  ListSearchBar,
  SkeletonTable,
  StatCard,
  TruncatedText,
  filterBySearch,
} from "@eduos/ui";
import { SuperAdminShell } from "@/components/super-admin/SuperAdminShell";
import { useApiData } from "@/lib/queries";

function formatInr(n: number): string {
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
  } catch {
    return `₹${n}`;
  }
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return iso;
  }
}

export function SuperAdminDefaultersView({ embedded = false }: { embedded?: boolean }) {
  const { data, error: queryError } = useApiData<SuperAdminDefaulterReportData>(
    "/api/super-admin/defaulters",
  );
  const error = queryError ? (queryError instanceof Error ? queryError.message : "Failed to load") : null;
  const [search, setSearch] = useState("");

  const topBranches = useMemo(() => (data?.branchesTotalDue ?? []).slice(0, 6), [data]);

  const filteredRows = useMemo(
    () =>
      filterBySearch(data?.rows ?? [], search, (r) => [
        r.studentName,
        r.studentId,
        r.guardianName,
        ...r.branches.map((b) => b.branchName),
      ]),
    [data?.rows, search],
  );

  const body = (
    <>
      {error ? <p className="eduos-admin-message eduos-admin-message--error">{error}</p> : null}
      {!data ? (
        <SkeletonTable columns={4} rows={5} />
      ) : (
        <>
          <section className="eduos-panel">
            <h2 className="eduos-section-title">Totals</h2>
            <div className="eduos-admin-stat-grid" style={{ marginTop: "0.75rem" }}>
              <StatCard label="Defaulters" value={data.rows.length} icon={<IconUsers />} accent="#2563eb" />
              <StatCard
                label="Total due"
                value={formatInr(data.totalDue)}
                icon={<IconRupee />}
                accent="#dc2626"
              />
            </div>
            {topBranches.length ? (
              <div style={{ marginTop: "1rem" }}>
                <h3 className="eduos-subsection-title" style={{ marginBottom: "0.75rem" }}>
                  Outstanding dues by branch (top)
                </h3>
                <BarChart
                  data={topBranches.map((b) => ({
                    label: b.branchName,
                    value: b.dueAmount,
                    valueLabel: formatInr(b.dueAmount),
                    color: "#dc2626",
                  }))}
                  height={180}
                />
              </div>
            ) : null}
          </section>

          <section className="eduos-panel">
            <h2 className="eduos-section-title">Defaulters</h2>
            <p className="eduos-section-desc">
              Aggregated dues across branches. After a transfer, open fees stay on the source
              branch ledger; destination shows only new enrollment dues.
            </p>
            {data.rows.length === 0 ? (
              <EmptyState title="No dues" description="No outstanding dues across branches." />
            ) : (
              <div className="eduos-table-wrap">
                <ListSearchBar
                  value={search}
                  onChange={setSearch}
                  placeholder="Search student, guardian, or branch…"
                  total={data.rows.length}
                  filtered={filteredRows.length}
                />
                <table className="eduos-admin-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th className="eduos-admin-table__nowrap">Total due</th>
                      <th>Branch breakdown</th>
                      <th className="eduos-admin-table__nowrap">Last payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((r) => (
                      <tr key={r.studentId}>
                        <td>
                          <div style={{ fontWeight: 800 }}>
                            <TruncatedText text={r.studentName} maxWidth="16rem" />
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "var(--eduos-text-muted)" }}>
                            {r.studentId}
                            {r.guardianName ? ` • Guardian: ${r.guardianName}` : ""}
                          </div>
                        </td>
                        <td style={{ fontWeight: 800 }}>{formatInr(r.totalDue)}</td>
                        <td style={{ fontSize: "0.8125rem" }}>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                            {r.branches
                              .slice()
                              .sort((a, b) => b.dueAmount - a.dueAmount)
                              .map((b) => (
                                <span key={b.branchId} className="eduos-tag">
                                  {b.branchName}: {formatInr(b.dueAmount)}
                                </span>
                              ))}
                          </div>
                        </td>
                        <td className="eduos-admin-table__nowrap">{formatDate(r.lastPaymentAt)}</td>
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
  return <SuperAdminShell title="Defaulter report">{body}</SuperAdminShell>;
}

export default function SuperAdminDefaultersPage() {
  // Legacy route: keep working, but prefer the merged Finance module.
  useEffect(() => {
    window.location.replace("/super-admin/finance?tab=defaulters");
  }, []);
  return <p className="eduos-empty">Redirecting…</p>;
}

