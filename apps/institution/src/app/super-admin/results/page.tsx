"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { SuperAdminResultsComparisonData } from "@eduos/types";
import {
  BarChart,
  ChartLegend,
  DonutChart,
  EmptyState,
  IconCheckCircle,
  IconChartBar,
  IconTrendUp,
  SkeletonTable,
  StatCard,
  TruncatedText,
  chartColor,
} from "@eduos/ui";
import { SuperAdminShell } from "@/components/super-admin/SuperAdminShell";
import { useApiData } from "@/lib/queries";

function pct(n: number): string {
  return `${n}%`;
}

function passColor(p: number): string {
  return p >= 85 ? "#1a5f4a" : p >= 75 ? "#d69e2e" : "#c53030";
}

const BAND_COLORS: Record<string, string> = {
  "90–100": "#1a5f4a",
  "75–89": "#2563eb",
  "60–74": "#d69e2e",
  "35–59": "#d69e2e",
  "35–74": "#d69e2e",
  "<35": "#dc2626",
  AB: "#94a3b8",
};

export default function SuperAdminResultsComparisonPage() {
  useEffect(() => {
    window.location.replace("/super-admin/insights?tab=results");
  }, []);
  return <p className="eduos-empty">Redirecting…</p>;
}

export function SuperAdminResultsComparisonView({ embedded = false }: { embedded?: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const branchFilter = params.get("branch") ?? "";
  const examFilter = params.get("exam") ?? "";

  const resultsUrl = useMemo(() => {
    const sp = new URLSearchParams();
    if (branchFilter) sp.set("branchId", branchFilter);
    if (examFilter) sp.set("examId", examFilter);
    const qs = sp.toString();
    return `/api/super-admin/results${qs ? `?${qs}` : ""}`;
  }, [branchFilter, examFilter]);

  const { data, error: queryError } = useApiData<SuperAdminResultsComparisonData>(resultsUrl);
  const error = queryError ? (queryError instanceof Error ? queryError.message : "Failed to load") : null;

  const setFilters = useCallback(
    (branch: string, exam: string) => {
      const sp = new URLSearchParams(params.toString());
      sp.set("tab", "results");
      if (branch) sp.set("branch", branch);
      else sp.delete("branch");
      if (exam) sp.set("exam", exam);
      else sp.delete("exam");
      router.replace(`/super-admin/insights?${sp.toString()}`);
    },
    [params, router],
  );

  const examOptions = useMemo(() => {
    const exams = data?.filterOptions.exams ?? [];
    if (!branchFilter) return exams;
    return exams.filter((e) => e.branchId === branchFilter);
  }, [data, branchFilter]);

  const summary = useMemo(() => {
    const rows = data?.branches ?? [];
    if (rows.length === 0) return { avgPass: 0, best: null as null | { branchName: string; passPercent: number } };
    const avgPass = Math.round(rows.reduce((acc, r) => acc + r.passPercent, 0) / rows.length);
    const best = rows.slice().sort((a, b) => b.passPercent - a.passPercent)[0] ?? null;
    return { avgPass, best: best ? { branchName: best.branchName, passPercent: best.passPercent } : null };
  }, [data]);

  const scoreBandChart = useMemo(() => {
    return (data?.scoreBands ?? []).map((b, i) => ({
      label: b.band,
      value: b.count,
      color: BAND_COLORS[b.band] ?? chartColor(i),
    }));
  }, [data]);

  const distDonut = useMemo(() => {
    const rows = data?.branches ?? [];
    const totals = rows.reduce(
      (acc, r) => {
        acc.distinction += r.dist.distinction;
        acc.firstClass += r.dist.firstClass;
        acc.secondClass += r.dist.secondClass;
        acc.fail += r.dist.fail;
        return acc;
      },
      { distinction: 0, firstClass: 0, secondClass: 0, fail: 0 },
    );
    return [
      { label: "Distinction", value: totals.distinction, color: "#1a5f4a" },
      { label: "First class", value: totals.firstClass, color: "#2563eb" },
      { label: "Second class", value: totals.secondClass, color: "#d69e2e" },
      { label: "Fail / absent", value: totals.fail, color: "#dc2626" },
    ].filter((d) => d.value > 0);
  }, [data]);

  const body = (
    <>
      {error ? <p className="eduos-admin-message eduos-admin-message--error">{error}</p> : null}
      {!data ? (
        <SkeletonTable columns={6} rows={5} />
      ) : (
        <>
          <section className="eduos-panel">
            <h2 className="eduos-section-title">Filters</h2>
            <p className="eduos-section-desc">Compare published exam results across campuses — aggregate view only.</p>
            <div className="eduos-portal-toolbar" style={{ marginTop: "0.75rem", flexWrap: "wrap", gap: "0.75rem" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem", fontSize: "0.8125rem" }}>
                <span style={{ fontWeight: 600 }}>Campus</span>
                <select
                  className="eduos-input"
                  value={branchFilter}
                  onChange={(e) => setFilters(e.target.value, "")}
                >
                  <option value="">All campuses</option>
                  {data.filterOptions.branches.map((b) => (
                    <option key={b.branchId} value={b.branchId}>
                      {b.branchName}
                    </option>
                  ))}
                </select>
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem", fontSize: "0.8125rem" }}>
                <span style={{ fontWeight: 600 }}>Exam</span>
                <select
                  className="eduos-input"
                  value={examFilter}
                  onChange={(e) => setFilters(branchFilter, e.target.value)}
                  disabled={examOptions.length === 0}
                >
                  <option value="">Latest published</option>
                  {examOptions.map((e) => (
                    <option key={e.examId} value={e.examId}>
                      {e.branchName} — {e.examLabel}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <section className="eduos-panel">
            <h2 className="eduos-section-title">Overview</h2>
            <p className="eduos-section-desc">Pass percentage and result metrics compared by branch.</p>
            <div className="eduos-admin-stat-grid" style={{ marginTop: "0.75rem" }}>
              <StatCard label="Branches" value={data.branches.length} icon={<IconChartBar />} accent="#2563eb" />
              <StatCard
                label="Average pass"
                value={pct(summary.avgPass)}
                icon={<IconTrendUp />}
                accent={passColor(summary.avgPass)}
              />
              {summary.best ? (
                <StatCard
                  label="Top branch"
                  value={pct(summary.best.passPercent)}
                  icon={<IconCheckCircle />}
                  accent="#1a5f4a"
                  sub={summary.best.branchName}
                />
              ) : null}
            </div>
          </section>

          {data.branches.length === 0 ? (
            <section className="eduos-panel">
              <EmptyState
                title={branchFilter ? "No results for this campus" : "No published results yet"}
                description={
                  branchFilter
                    ? "This campus has no published exam results for the selected filter. Try another campus or exam."
                    : "Publish exam results from a branch admin portal to see comparison charts here."
                }
              />
            </section>
          ) : (
            <>
              <section className="eduos-panel">
                <h2 className="eduos-section-title">Pass % by campus</h2>
                <BarChart
                  data={data.branches
                    .slice()
                    .sort((a, b) => b.passPercent - a.passPercent)
                    .map((r) => ({
                      label: r.branchName,
                      value: r.passPercent,
                      valueLabel: pct(r.passPercent),
                      color: passColor(r.passPercent),
                    }))}
                  height={180}
                />
              </section>

              {scoreBandChart.length > 0 ? (
                <section className="eduos-panel">
                  <h2 className="eduos-section-title">Score bands</h2>
                  <p className="eduos-section-desc">Student count by score range across filtered campuses.</p>
                  <BarChart data={scoreBandChart} height={180} />
                </section>
              ) : null}

              {distDonut.length > 0 ? (
                <section className="eduos-panel">
                  <h2 className="eduos-section-title">Result class distribution</h2>
                  <div className="eduos-chart-split">
                    <DonutChart
                      data={distDonut}
                      centerValue={distDonut.reduce((acc, d) => acc + d.value, 0)}
                      centerLabel="Students"
                    />
                    <div className="eduos-chart-split__legend">
                      <ChartLegend
                        items={distDonut.map((d) => ({ label: d.label, color: d.color, value: d.value }))}
                      />
                    </div>
                  </div>
                </section>
              ) : null}

              <section className="eduos-panel">
                <h2 className="eduos-section-title">Campus snapshot</h2>
                <div className="eduos-table-wrap">
                  <table className="eduos-admin-table">
                    <thead>
                      <tr>
                        <th>Branch</th>
                        <th className="eduos-admin-table__nowrap">Exam</th>
                        <th className="eduos-admin-table__nowrap">Pass %</th>
                        <th className="eduos-admin-table__nowrap">Appeared</th>
                        <th className="eduos-admin-table__nowrap">Passed</th>
                        <th className="eduos-admin-table__nowrap">Avg %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.branches
                        .slice()
                        .sort((a, b) => b.passPercent - a.passPercent)
                        .map((r) => (
                          <tr key={r.branchId}>
                            <td style={{ fontWeight: 700 }}>
                              <TruncatedText text={r.branchName} maxWidth="16rem" />
                            </td>
                            <td className="eduos-admin-table__nowrap">{r.examLabel}</td>
                            <td style={{ fontWeight: 700 }}>{pct(r.passPercent)}</td>
                            <td>{r.appeared}</td>
                            <td>{r.passed}</td>
                            <td>{pct(r.avgScorePercent)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </>
      )}
    </>
  );

  if (embedded) return body;
  return <SuperAdminShell title="Results comparison">{body}</SuperAdminShell>;
}
