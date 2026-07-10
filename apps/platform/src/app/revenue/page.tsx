"use client";

import type { PlatformPlansData, PlatformRevenueReport } from "@eduos/types";
import {
  BarChart,
  ChartLegend,
  DonutChart,
  IconHourglass,
  IconRupee,
  IconTrendUp,
  IconWallet,
  SkeletonText,
  StatCard,
  chartColor,
} from "@eduos/ui";
import { PlatformOwnerShell } from "@/components/platform-owner/PlatformOwnerShell";
import { ApiError } from "@/lib/api-client";
import { useApiData } from "@/lib/queries";

function formatInr(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}

function formatInrCompact(n: number): string {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(1)}Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)}L`;
  if (n >= 1e3) return `₹${Math.round(n / 1e3)}k`;
  return `₹${n}`;
}

export default function PlatformRevenuePage() {
  const { data: report, error: queryError } = useApiData<PlatformRevenueReport>(
    "/api/platform-owner/revenue",
  );
  const { data: plansData } = useApiData<PlatformPlansData>("/api/platform-owner/plans");
  const catalog = plansData?.catalog ?? [];
  const standardPrice = catalog.find((p) => p.plan === "standard")?.pricePerStudentInr;
  const aiPrice = catalog.find((p) => p.plan === "ai")?.pricePerStudentInr;
  const error = queryError
    ? queryError instanceof ApiError
      ? queryError.message
      : "Failed to load revenue report"
    : null;

  return (
    <PlatformOwnerShell title="Revenue reporting">
      {error ? <p className="eduos-admin-message eduos-admin-message--error">{error}</p> : null}

      <p className="eduos-lead" style={{ margin: 0 }}>
        Annual per-student subscription fees aggregated across all tenants. No card or bank account
        data is stored.
      </p>

      {!report ? (
        <SkeletonText lines={4} />
      ) : (
        <>
          <div className="eduos-admin-stat-grid">
            <StatCard
              label="Collected"
              value={formatInr(report.collectedSubscriptionInr ?? report.totalMrrInr)}
              icon={<IconRupee />}
              accent="#1a5f4a"
            />
            <StatCard
              label="Annual subscription"
              value={formatInr(report.annualSubscriptionInr ?? report.arrInr)}
              icon={<IconWallet />}
              accent="#2563eb"
            />
            <StatCard
              label="Total students"
              value={report.totalStudents ?? "—"}
              icon={<IconTrendUp />}
              accent="#7c3aed"
            />
            <StatCard label="On trial" value={report.trialTenantCount} icon={<IconHourglass />} accent="#d69e2e" />
          </div>

          <p className="eduos-body-sm" style={{ margin: 0, color: "var(--eduos-text-muted)" }}>
            {report.paymentDataNote} As of {new Date(report.asOf).toLocaleString()}.
          </p>

          <section className="eduos-panel">
            <h2 className="eduos-section-title">Annual subscription by plan</h2>
            <p className="eduos-section-desc">
              {standardPrice != null && aiPrice != null ? (
                <>
                  Per-student yearly list rates: Standard ERP {formatInr(standardPrice)}/student,
                  AI ERP {formatInr(aiPrice)}/student (before per-school discounts).
                </>
              ) : (
                <>Per-student yearly rates from the live plan catalog.</>
              )}
            </p>
            {report.byPlan.some((row) => row.mrrInr > 0) ? (
              <div className="eduos-chart-split" style={{ marginBottom: "1rem" }}>
                <DonutChart
                  data={report.byPlan.map((row, i) => ({
                    label: row.label,
                    value: row.mrrInr,
                    color: chartColor(i),
                  }))}
                  centerValue={formatInrCompact(report.annualSubscriptionInr ?? report.arrInr)}
                  centerLabel="Annual"
                />
                <div className="eduos-chart-split__legend">
                  <ChartLegend
                    items={report.byPlan.map((row, i) => ({
                      label: `${row.label} · ${row.percentOfMrr}%`,
                      color: chartColor(i),
                      value: formatInr(row.mrrInr),
                    }))}
                  />
                </div>
              </div>
            ) : null}
            <div className="eduos-table-wrap">
              <table className="eduos-admin-table">
                <thead>
                  <tr>
                    <th>Plan</th>
                    <th className="eduos-admin-table__nowrap">Paying</th>
                    <th className="eduos-admin-table__nowrap">Trial</th>
                    <th className="eduos-admin-table__nowrap">MRR</th>
                    <th className="eduos-admin-table__nowrap">% of total</th>
                  </tr>
                </thead>
                <tbody>
                  {report.byPlan.map((row) => (
                    <tr key={row.plan}>
                      <td style={{ fontWeight: 600 }}>{row.label}</td>
                      <td className="eduos-admin-table__nowrap">{row.payingTenants}</td>
                      <td className="eduos-admin-table__nowrap">{row.trialTenants}</td>
                      <td className="eduos-admin-table__nowrap">{formatInr(row.mrrInr)}</td>
                      <td className="eduos-admin-table__nowrap">{row.percentOfMrr}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="eduos-panel">
            <h2 className="eduos-section-title">MRR trend (6 months)</h2>
            <p className="eduos-section-desc">Monthly recurring revenue across the last 6 months.</p>
            <BarChart
              data={report.mrrTrend.map((point) => ({
                label: point.month,
                value: point.mrrInr,
                valueLabel: formatInrCompact(point.mrrInr),
              }))}
              height={200}
            />
          </section>
        </>
      )}
    </PlatformOwnerShell>
  );
}
