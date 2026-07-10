"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { PlatformOwnerDashboardData } from "@eduos/types";
import { PLATFORM_OWNER_ROUTES } from "@eduos/constants";
import {
  BarChart,
  Button,
  ChartLegend,
  DonutChart,
  IconAlertTriangle,
  IconBuilding,
  IconCheckCircle,
  IconRupee,
  PortalDashboardSkeleton,
  PortalWelcomeStrip,
  PortalFilterBar,
  filterBySearch,
  IconUsers,
  IconWallet,
  Sparkline,
  StatCard,
  TruncatedText,
  chartColor,
} from "@eduos/ui";
import { PlatformOwnerShell } from "@/components/platform-owner/PlatformOwnerShell";
import { PlatformStatusTag } from "@/components/platform-owner/PlatformStatusTag";
import { ApiError } from "@/lib/api-client";
import { useApiData } from "@/lib/queries";

const PLAN_LABEL = { standard: "Standard ERP", ai: "AI ERP" };

const STATUS_COLORS = { active: "#1a5f4a", inactive: "#dc2626" } as const;

function formatInr(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}

function formatInrCompact(n: number): string {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(1)}Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)}L`;
  if (n >= 1e3) return `₹${Math.round(n / 1e3)}k`;
  return `₹${n}`;
}

function normalizeDashboardData(raw: PlatformOwnerDashboardData): PlatformOwnerDashboardData {
  const stats = raw.stats ?? { total: 0, active: 0, inactive: 0, pending: 0 };
  const platformStats = raw.platformStats ?? {
    totalStudents: 0,
    annualSubscriptionInr: raw.mrrInr ?? 0,
    collectedSubscriptionInr: raw.mrrInr ?? 0,
    billingStats: { paid: 0, overdue: 0, trial: stats.total },
  };
  return {
    stats,
    platformStats,
    mrrInr: platformStats.collectedSubscriptionInr,
    mrrTrend: raw.mrrTrend ?? [],
    revenueByPlan: raw.revenueByPlan ?? [],
    statusDistribution:
      raw.statusDistribution ?? [
        { status: "active", count: stats.active },
        { status: "inactive", count: stats.inactive },
      ],
    signupTrend: raw.signupTrend ?? [],
    recentTenants: raw.recentTenants ?? [],
    planDistribution: raw.planDistribution ?? [],
  };
}

export default function PlatformDashboardPage() {
  const [tenantSearch, setTenantSearch] = useState("");

  const { data: rawData, error: queryError } = useApiData<PlatformOwnerDashboardData>(
    "/api/platform-owner/dashboard",
  );
  const data = useMemo(() => (rawData ? normalizeDashboardData(rawData) : null), [rawData]);
  const error = queryError
    ? queryError instanceof ApiError
      ? queryError.message
      : "Failed to load dashboard"
    : null;

  const platformStats = data?.platformStats;
  const collectedTrend = data?.mrrTrend ?? [];

  const filteredRecentTenants = useMemo(
    () =>
      filterBySearch(data?.recentTenants ?? [], tenantSearch, (t) => [
        t.name,
        t.subdomain,
        t.city,
        t.plan,
        t.status,
      ]),
    [data?.recentTenants, tenantSearch],
  );

  return (
    <PlatformOwnerShell title="Dashboard">
      {error ? <p className="eduos-admin-message eduos-admin-message--error">{error}</p> : null}
      {!data ? (
        <PortalDashboardSkeleton statCount={4} />
      ) : (
        <div className="portal-dashboard-stack">
          <PortalWelcomeStrip
            eyebrow="Platform overview"
            title="PiiAura control center"
            description="Revenue, tenant health, signups, and subscription tiers across all institutions."
            badge={`${data.stats.active} active tenants`}
          />
          <div className="eduos-admin-stat-grid">
            <StatCard
              label="Collected subscriptions"
              value={formatInr(platformStats?.collectedSubscriptionInr ?? 0)}
              icon={<IconRupee />}
              accent="#1a5f4a"
              sub="Annual fees received"
            >
              {collectedTrend.length > 0 ? (
                <Sparkline
                  data={collectedTrend.map((point) => point.mrrInr)}
                  width={160}
                  height={40}
                />
              ) : null}
            </StatCard>
            <StatCard
              label="Total students"
              value={platformStats?.totalStudents ?? 0}
              icon={<IconUsers />}
              accent="#2563eb"
              sub="Across all tenants"
            />
            <StatCard
              label="Annual subscription"
              value={formatInr(platformStats?.annualSubscriptionInr ?? 0)}
              icon={<IconWallet />}
              accent="#7c3aed"
              sub="Per-student yearly fees"
            />
            <StatCard label="Total tenants" value={data.stats.total} icon={<IconBuilding />} />
          </div>

          <div className="eduos-admin-stat-grid">
            <StatCard
              label="Active"
              value={data.stats.active}
              icon={<IconCheckCircle />}
              accent="#1a5f4a"
            />
            <StatCard
              label="Inactive"
              value={data.stats.inactive}
              icon={<IconAlertTriangle />}
              accent="#dc2626"
            />
          </div>

          <div className="eduos-admin-grid-2">
            <section className="eduos-panel">
              <div className="eduos-panel__header">
                <div>
                  <h2 className="eduos-section-title">Subscription collected</h2>
                  <p className="eduos-section-desc">
                    Annual per-student fees collected over the last 6 months.
                  </p>
                </div>
                <div className="eduos-panel__actions">
                  <Link href={PLATFORM_OWNER_ROUTES.revenue} className="eduos-link">
                    Revenue report
                  </Link>
                </div>
              </div>
              <BarChart
                data={collectedTrend.map((point) => ({
                  label: point.month,
                  value: point.mrrInr,
                  valueLabel: formatInrCompact(point.mrrInr),
                }))}
                height={200}
              />
            </section>

            <section className="eduos-panel">
              <div className="eduos-panel__header">
                <div>
                  <h2 className="eduos-section-title">Annual subscription by plan</h2>
                  <p className="eduos-section-desc">
                    Yearly fees (students × plan rate) across all institutions.
                  </p>
                </div>
              </div>
              {data.revenueByPlan.some((row) => (row.annualSubscriptionInr ?? row.mrrInr) > 0) ? (
                <div className="eduos-chart-split">
                  <DonutChart
                    data={data.revenueByPlan.map((row, i) => ({
                      label: PLAN_LABEL[row.plan],
                      value: row.annualSubscriptionInr ?? row.mrrInr,
                      color: chartColor(i),
                    }))}
                    centerValue={formatInrCompact(platformStats?.annualSubscriptionInr ?? 0)}
                    centerLabel="Annual"
                  />
                  <div className="eduos-chart-split__legend">
                    <ChartLegend
                      items={data.revenueByPlan.map((row, i) => ({
                        label: PLAN_LABEL[row.plan],
                        color: chartColor(i),
                        value: formatInr(row.annualSubscriptionInr ?? row.mrrInr),
                      }))}
                    />
                  </div>
                </div>
              ) : (
                <p className="eduos-section-desc" style={{ margin: 0 }}>
                  No enrolled students yet.
                </p>
              )}
            </section>
          </div>

          <div className="eduos-admin-grid-2">
            <section className="eduos-panel">
              <h2 className="eduos-section-title">Tenant status</h2>
              <p className="eduos-section-desc">Active vs inactive institutions on the platform.</p>
              <div className="eduos-chart-split">
                <DonutChart
                  data={data.statusDistribution.map((row) => ({
                    label: row.status === "active" ? "Active" : "Inactive",
                    value: row.count,
                    color: STATUS_COLORS[row.status],
                  }))}
                  centerValue={data.stats.active + data.stats.inactive}
                  centerLabel="Tenants"
                />
                <div className="eduos-chart-split__legend">
                  <ChartLegend
                    items={data.statusDistribution.map((row) => ({
                      label: row.status === "active" ? "Active" : "Inactive",
                      color: STATUS_COLORS[row.status],
                      value: row.count,
                    }))}
                  />
                </div>
              </div>
            </section>

            <section className="eduos-panel">
              <div className="eduos-panel__header">
                <div>
                  <h2 className="eduos-section-title">New signups</h2>
                  <p className="eduos-section-desc">Institutions onboarded per month (last 6 months).</p>
                </div>
                <div className="eduos-panel__actions">
                  <Link href={PLATFORM_OWNER_ROUTES.analytics} className="eduos-link">
                    Full analytics
                  </Link>
                </div>
              </div>
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
              <div className="eduos-panel__header">
                <div>
                  <h2 className="eduos-section-title">Plan distribution</h2>
                  <p className="eduos-section-desc">Tenants by subscription tier.</p>
                </div>
                <div className="eduos-panel__actions">
                  <Link href={PLATFORM_OWNER_ROUTES.tenantNew}>
                    <Button type="button">New tenant</Button>
                  </Link>
                </div>
              </div>
              <div className="eduos-chart-split">
                <DonutChart
                  data={data.planDistribution.map((row, i) => ({
                    label: PLAN_LABEL[row.plan],
                    value: row.count,
                    color: chartColor(i),
                  }))}
                  centerValue={data.stats.total}
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
                <h2 className="eduos-section-title">Recent tenants</h2>
                <p className="eduos-section-desc">Latest institutions on the platform.</p>
              </div>
              <div className="eduos-panel__actions">
                <Link href={PLATFORM_OWNER_ROUTES.tenants} className="eduos-link">
                  All tenants
                </Link>
              </div>
            </div>
            <PortalFilterBar
              search={tenantSearch}
              onSearchChange={setTenantSearch}
              searchPlaceholder="Search institution, subdomain, or city…"
              total={data.recentTenants.length}
              filtered={filteredRecentTenants.length}
            />
            <div className="eduos-table-wrap">
              <table className="eduos-admin-table">
                <thead>
                  <tr>
                    <th>Institution</th>
                    <th className="eduos-admin-table__nowrap">Subdomain</th>
                    <th className="eduos-admin-table__nowrap">Plan</th>
                    <th className="eduos-admin-table__nowrap">Students</th>
                    <th className="eduos-admin-table__nowrap">Status</th>
                    <th>City</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecentTenants.map((t) => (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 600 }}>
                        <Link href={PLATFORM_OWNER_ROUTES.tenantDetail(t.id)} className="eduos-link">
                          <TruncatedText text={t.name} maxWidth="16rem" />
                        </Link>
                      </td>
                      <td className="eduos-admin-table__nowrap">
                        <code>{t.subdomain}</code>
                      </td>
                      <td className="eduos-admin-table__nowrap">{PLAN_LABEL[t.plan]}</td>
                      <td className="eduos-admin-table__nowrap">{t.studentCount}</td>
                      <td className="eduos-admin-table__nowrap">
                        <PlatformStatusTag status={t.status} />
                      </td>
                      <td>{t.city}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </PlatformOwnerShell>
  );
}
