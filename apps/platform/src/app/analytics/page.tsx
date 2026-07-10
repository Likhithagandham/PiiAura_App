"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { PlatformAnalyticsData, PlatformTenantPlan } from "@eduos/types";
import { PLATFORM_OWNER_ROUTES } from "@eduos/constants";
import {
  BarChart,
  ChartLegend,
  DonutChart,
  EmptyState,
  IconAlertTriangle,
  IconBuilding,
  IconCheckCircle,
  IconClock,
  IconTrendUp,
  SkeletonText,
  StatCard,
  TruncatedText,
  chartColor,
} from "@eduos/ui";
import { PlatformOwnerShell } from "@/components/platform-owner/PlatformOwnerShell";
import { ApiError } from "@/lib/api-client";
import { useApiData } from "@/lib/queries";

const PLAN_LABEL: Record<PlatformTenantPlan, string> = {
  standard: "Standard ERP",
  ai: "AI ERP",
};

const STATUS_COLORS = {
  active: "#1a5f4a",
  inactive: "#dc2626",
  pending: "#d69e2e",
} as const;

function normalizeAnalyticsData(raw: PlatformAnalyticsData): PlatformAnalyticsData {
  return {
    totalInstitutions: raw.totalInstitutions ?? 0,
    activeCount: raw.activeCount ?? 0,
    inactiveCount: raw.inactiveCount ?? 0,
    pendingCount: raw.pendingCount ?? 0,
    planDistribution: raw.planDistribution ?? [],
    signupTrend: raw.signupTrend ?? [],
    newSignupsThisMonth: raw.newSignupsThisMonth ?? 0,
    recentSignups: raw.recentSignups ?? [],
  };
}

export default function PlatformAnalyticsPage() {
  const { data: rawData, error: queryError } = useApiData<PlatformAnalyticsData>(
    "/api/platform-owner/analytics",
  );
  const data = useMemo(() => (rawData ? normalizeAnalyticsData(rawData) : null), [rawData]);
  const error = queryError
    ? queryError instanceof ApiError
      ? queryError.message
      : "Failed to load analytics"
    : null;

  const monthLabel = new Date().toLocaleString("en-IN", { month: "long", year: "numeric" });

  return (
    <PlatformOwnerShell title="Analytics">
      {error ? <p className="eduos-admin-message eduos-admin-message--error">{error}</p> : null}
      {!data ? (
        <SkeletonText lines={4} />
      ) : (
        <>
          <div className="eduos-admin-stat-grid">
            <StatCard
              label="Total institutions"
              value={data.totalInstitutions}
              icon={<IconBuilding />}
            />
            <StatCard
              label="Active"
              value={data.activeCount}
              icon={<IconCheckCircle />}
              accent="#1a5f4a"
            />
            <StatCard
              label="Inactive"
              value={data.inactiveCount}
              icon={<IconAlertTriangle />}
              accent="#dc2626"
            />
            <StatCard
              label="Pending"
              value={data.pendingCount}
              icon={<IconClock />}
              accent="#d69e2e"
            />
            <StatCard
              label={`New signups (${monthLabel})`}
              value={data.newSignupsThisMonth}
              icon={<IconTrendUp />}
              accent="#2563eb"
            />
          </div>

          <div className="eduos-admin-grid-2">
            <section className="eduos-panel">
              <h2 className="eduos-section-title">Institution status</h2>
              <p className="eduos-section-desc">Breakdown across active, inactive, and pending tenants.</p>
              <div className="eduos-chart-split">
                <DonutChart
                  data={[
                    { label: "Active", value: data.activeCount, color: STATUS_COLORS.active },
                    { label: "Inactive", value: data.inactiveCount, color: STATUS_COLORS.inactive },
                    { label: "Pending", value: data.pendingCount, color: STATUS_COLORS.pending },
                  ].filter((row) => row.value > 0)}
                  centerValue={data.totalInstitutions}
                  centerLabel="Tenants"
                />
                <div className="eduos-chart-split__legend">
                  <ChartLegend
                    items={[
                      { label: "Active", color: STATUS_COLORS.active, value: data.activeCount },
                      { label: "Inactive", color: STATUS_COLORS.inactive, value: data.inactiveCount },
                      { label: "Pending", color: STATUS_COLORS.pending, value: data.pendingCount },
                    ]}
                  />
                </div>
              </div>
            </section>

            <section className="eduos-panel">
              <h2 className="eduos-section-title">Signup trend</h2>
              <p className="eduos-section-desc">New institutions onboarded per month (last 6 months).</p>
              <BarChart
                data={data.signupTrend.map((point, i) => ({
                  label: point.month,
                  value: point.count,
                  color: chartColor(i % 3),
                }))}
                height={200}
              />
            </section>
          </div>

          <div className="eduos-admin-grid-2">
            <section className="eduos-panel">
              <h2 className="eduos-section-title">Plan distribution</h2>
              <p className="eduos-section-desc">Institutions by subscription tier.</p>
              <div className="eduos-chart-split">
                <DonutChart
                  data={data.planDistribution.map((row, i) => ({
                    label: PLAN_LABEL[row.plan],
                    value: row.count,
                    color: chartColor(i),
                  }))}
                  centerValue={data.totalInstitutions}
                  centerLabel="Tenants"
                />
                <div className="eduos-chart-split__legend">
                  <ChartLegend
                    items={data.planDistribution.map((row, i) => ({
                      label: PLAN_LABEL[row.plan],
                      color: chartColor(i),
                      value: row.count,
                    }))}
                  />
                </div>
              </div>
            </section>

            <section className="eduos-panel">
              <h2 className="eduos-section-title">Tenants by plan</h2>
              <p className="eduos-section-desc">Subscription tier counts at a glance.</p>
              <BarChart
                data={data.planDistribution.map((row, i) => ({
                  label: PLAN_LABEL[row.plan],
                  value: row.count,
                  color: chartColor(i),
                }))}
                height={200}
              />
            </section>
          </div>

          <section className="eduos-panel">
            <div className="eduos-panel__header">
              <div>
                <h2 className="eduos-section-title">New signups this month</h2>
                <p className="eduos-section-desc">
                  {data.newSignupsThisMonth === 0
                    ? "No new institutions onboarded this month."
                    : `${data.newSignupsThisMonth} institution(s) created in ${monthLabel}.`}
                </p>
              </div>
            </div>
            {data.recentSignups.length === 0 ? (
              <EmptyState
                compact
                title="No signups this month"
                description="New institutions onboarded this month will appear here."
              />
            ) : (
              <div className="eduos-table-wrap">
                <table className="eduos-admin-table">
                  <thead>
                    <tr>
                      <th>Institution</th>
                      <th className="eduos-admin-table__nowrap">Subdomain</th>
                      <th className="eduos-admin-table__nowrap">Plan</th>
                      <th className="eduos-admin-table__nowrap">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentSignups.map((t) => (
                      <tr key={t.tenantId}>
                        <td style={{ fontWeight: 600 }}>
                          <Link
                            href={PLATFORM_OWNER_ROUTES.tenantDetail(t.tenantId)}
                            className="eduos-link"
                          >
                            <TruncatedText text={t.name} maxWidth="16rem" />
                          </Link>
                        </td>
                        <td className="eduos-admin-table__nowrap">
                          <code>{t.subdomain}</code>
                        </td>
                        <td className="eduos-admin-table__nowrap">{PLAN_LABEL[t.plan]}</td>
                        <td className="eduos-admin-table__nowrap">
                          {new Date(t.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </PlatformOwnerShell>
  );
}
