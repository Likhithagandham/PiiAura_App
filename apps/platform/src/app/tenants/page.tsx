"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type {
  PlatformInstitutionType,
  PlatformTenantListData,
  PlatformTenantListFilters,
  PlatformTenantPlan,
  PlatformTenantStatus,
  PlatformTenantSummary,
} from "@eduos/types";
import { PLATFORM_OWNER_ROUTES } from "@eduos/constants";
import {
  BarChart,
  Button,
  ChartLegend,
  DonutChart,
  EmptyState,
  IconAlertTriangle,
  IconBuilding,
  IconCheckCircle,
  IconClock,
  IconRupee,
  IconUsers,
  IconWallet,
  SkeletonTable,
  StatCard,
  TruncatedText,
  chartColor,
} from "@eduos/ui";
import { platformFetch } from "@/lib/platform-owner/fetch";
import { PlatformOwnerShell } from "@/components/platform-owner/PlatformOwnerShell";
import { PlatformStatusTag } from "@/components/platform-owner/PlatformStatusTag";
import { PlatformBillingStatusTag } from "@/components/platform-owner/PlatformBillingStatusTag";
import { ApiError, apiSend } from "@/lib/api-client";
import { useApiData } from "@/lib/queries";

function formatInr(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}

const PLAN_LABEL: Record<PlatformTenantPlan, string> = {
  standard: "Standard ERP",
  ai: "AI ERP",
};

const STATUS_COLORS: Record<PlatformTenantStatus, string> = {
  active: "#1a5f4a",
  inactive: "#dc2626",
  pending: "#d69e2e",
};

export default function PlatformTenantsPage() {
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [filters, setFilters] = useState<PlatformTenantListFilters>({
    plan: "all",
    institutionType: "all",
    city: "all",
    status: "all",
    q: "",
  });
  // Debounced so typing in the search box doesn't fire a query per keystroke —
  // `filters` drives the controlled inputs immediately, `debouncedFilters` drives the fetch.
  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedFilters(filters), filters.q ? 300 : 0);
    return () => clearTimeout(timer);
  }, [filters]);

  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    if (debouncedFilters.q) p.set("q", debouncedFilters.q);
    if (debouncedFilters.plan && debouncedFilters.plan !== "all") p.set("plan", debouncedFilters.plan);
    if (debouncedFilters.institutionType && debouncedFilters.institutionType !== "all")
      p.set("type", debouncedFilters.institutionType);
    if (debouncedFilters.city && debouncedFilters.city !== "all") p.set("city", debouncedFilters.city);
    if (debouncedFilters.status && debouncedFilters.status !== "all")
      p.set("status", debouncedFilters.status);
    return p.toString();
  }, [debouncedFilters]);

  const {
    data,
    error: queryError,
    refetch,
  } = useApiData<PlatformTenantListData>(`/api/platform-owner/tenants?${queryString}`);
  const loadError = queryError
    ? queryError instanceof ApiError
      ? queryError.message
      : "Failed to load tenants"
    : null;
  const error = actionError ?? loadError;

  const chartData = useMemo(() => {
    const tenants = data?.tenants ?? [];
    const plans: PlatformTenantPlan[] = ["standard", "ai"];
    const planDistribution = plans.map((plan) => ({
      plan,
      count: tenants.filter((t) => t.plan === plan).length,
    }));
    const statusDistribution: { status: PlatformTenantStatus; count: number }[] = [
      { status: "active", count: tenants.filter((t) => t.status === "active").length },
      { status: "inactive", count: tenants.filter((t) => t.status === "inactive").length },
      { status: "pending", count: tenants.filter((t) => t.status === "pending").length },
    ];
    return { planDistribution, statusDistribution, total: tenants.length };
  }, [data?.tenants]);

  async function exportCsv() {
    setExporting(true);
    setActionError(null);
    try {
      const res = await platformFetch(`/api/platform-owner/tenants/export?${queryString}`);
      if (res.status === 401) return;
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error((json as { error?: string }).error ?? "Export failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `eduos-institutions-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setActionMsg("Institution list exported as CSV.");
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExporting(false);
    }
  }

  async function toggleStatus(tenant: PlatformTenantSummary) {
    setActionMsg(null);
    setActionError(null);
    const action = tenant.status === "active" ? "deactivate" : "activate";
    try {
      const json = await apiSend<{ message?: string }>("/api/platform-owner/tenants/actions", "PATCH", {
        tenantId: tenant.id,
        action,
      });
      setActionMsg(json.message ?? "Updated");
      await refetch();
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : "Action failed");
    }
  }

  return (
    <PlatformOwnerShell title="Tenants">
      {error ? <p className="eduos-admin-message eduos-admin-message--error">{error}</p> : null}
      {actionMsg ? (
        <p className="eduos-admin-message">{actionMsg}</p>
      ) : null}

      <header className="eduos-page-header">
        <div>
          <p className="eduos-lead" style={{ margin: 0 }}>
            Search by name, city, or subdomain. Export the filtered list as CSV for
            operations.
          </p>
        </div>
        <div className="eduos-panel__actions">
          <Button type="button" variant="secondary" onClick={exportCsv} disabled={exporting}>
            {exporting ? "Exporting…" : "Export CSV"}
          </Button>
          <Link href={PLATFORM_OWNER_ROUTES.tenantNew}>
            <Button type="button">New tenant</Button>
          </Link>
        </div>
      </header>

      <section className="eduos-panel">
        <h2 className="eduos-section-title">Filters</h2>
        <p className="eduos-section-desc">Refine the list below. Filters apply automatically.</p>
        <div className="eduos-filter-grid">
          <label className="eduos-filter-grid__label">
            Search (name, city, subdomain)
            <input
              className="eduos-input eduos-input--field"
              value={filters.q ?? ""}
              onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value }))}
              placeholder="e.g. Pune, horizon, Lakeside"
              aria-label="Search tenants by name, city, or subdomain"
            />
          </label>
          <label className="eduos-filter-grid__label">
            Plan
            <select
              className="eduos-input eduos-input--field"
              value={filters.plan ?? "all"}
              onChange={(e) =>
                setFilters((p) => ({
                  ...p,
                  plan: e.target.value as PlatformTenantPlan | "all",
                }))
              }
            >
              <option value="all">All plans</option>
              <option value="standard">Standard ERP</option>
              <option value="ai">AI ERP</option>
            </select>
          </label>
          <label className="eduos-filter-grid__label">
            Type
            <select
              className="eduos-input eduos-input--field"
              value={filters.institutionType ?? "all"}
              onChange={(e) =>
                setFilters((p) => ({
                  ...p,
                  institutionType: e.target.value as PlatformInstitutionType | "all",
                }))
              }
            >
              <option value="all">All types</option>
              <option value="school">School</option>
              <option value="college">College</option>
            </select>
          </label>
          <label className="eduos-filter-grid__label">
            City
            <select
              className="eduos-input eduos-input--field"
              value={filters.city ?? "all"}
              onChange={(e) => setFilters((p) => ({ ...p, city: e.target.value }))}
            >
              <option value="all">All cities</option>
              {(data?.filterOptions.cities ?? []).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="eduos-filter-grid__label">
            Status
            <select
              className="eduos-input eduos-input--field"
              value={filters.status ?? "all"}
              onChange={(e) =>
                setFilters((p) => ({
                  ...p,
                  status: e.target.value as PlatformTenantStatus | "all",
                }))
              }
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </label>
        </div>
      </section>

      {data ? (
        <>
          <div className="eduos-admin-stat-grid">
            <StatCard label="Shown" value={chartData.total} icon={<IconBuilding />} />
            <StatCard
              label="Students"
              value={data.platformStats?.totalStudents ?? data.tenants.reduce((s, t) => s + t.studentCount, 0)}
              icon={<IconUsers />}
              accent="#2563eb"
            />
            <StatCard
              label="Annual subscription"
              value={formatInr(
                data.platformStats?.annualSubscriptionInr ??
                  data.tenants.reduce((s, t) => s + (t.annualSubscriptionInr ?? 0), 0),
              )}
              icon={<IconWallet />}
              accent="#7c3aed"
            />
            <StatCard
              label="Collected"
              value={formatInr(
                data.platformStats?.collectedSubscriptionInr ??
                  data.tenants.reduce((s, t) => s + (t.collectedSubscriptionInr ?? 0), 0),
              )}
              icon={<IconRupee />}
              accent="#1a5f4a"
            />
            <StatCard
              label="Active"
              value={chartData.statusDistribution.find((r) => r.status === "active")?.count ?? 0}
              icon={<IconCheckCircle />}
              accent="#1a5f4a"
            />
            <StatCard
              label="Inactive"
              value={chartData.statusDistribution.find((r) => r.status === "inactive")?.count ?? 0}
              icon={<IconAlertTriangle />}
              accent="#dc2626"
            />
            <StatCard
              label="Pending"
              value={chartData.statusDistribution.find((r) => r.status === "pending")?.count ?? 0}
              icon={<IconClock />}
              accent="#d69e2e"
            />
          </div>

          {chartData.total > 0 ? (
            <div className="eduos-admin-grid-2">
              <section className="eduos-panel">
                <h2 className="eduos-section-title">Filtered plan mix</h2>
                <p className="eduos-section-desc">Subscription tiers in the current result set.</p>
                <div className="eduos-chart-split">
                  <DonutChart
                    data={chartData.planDistribution.map((row, i) => ({
                      label: PLAN_LABEL[row.plan],
                      value: row.count,
                      color: chartColor(i),
                    }))}
                    centerValue={chartData.total}
                    centerLabel="Tenants"
                  />
                  <div className="eduos-chart-split__legend">
                    <ChartLegend
                      items={chartData.planDistribution.map((row, i) => ({
                        label: PLAN_LABEL[row.plan],
                        color: chartColor(i),
                        value: row.count,
                      }))}
                    />
                  </div>
                </div>
              </section>

              <section className="eduos-panel">
                <h2 className="eduos-section-title">Filtered status</h2>
                <p className="eduos-section-desc">Status breakdown for the current result set.</p>
                <BarChart
                  data={chartData.statusDistribution
                    .filter((row) => row.count > 0)
                    .map((row) => ({
                      label: row.status.charAt(0).toUpperCase() + row.status.slice(1),
                      value: row.count,
                      color: STATUS_COLORS[row.status],
                    }))}
                  height={200}
                />
              </section>
            </div>
          ) : null}
        </>
      ) : null}

      <section className="eduos-panel">
        <div className="eduos-panel__header">
          <div>
            <h2 className="eduos-section-title">All institutions</h2>
            <p className="eduos-section-desc">
              {data
                ? `${data.tenants.length} tenant${data.tenants.length === 1 ? "" : "s"} shown`
                : "Loading tenant list…"}
            </p>
          </div>
        </div>

        {!data ? (
          <SkeletonTable rows={6} columns={11} label="Loading tenants…" />
        ) : data.tenants.length === 0 ? (
          <EmptyState
            title="No tenants match these filters"
            description="Try clearing or widening the filters above to see more institutions."
          />
        ) : (
          <div className="eduos-table-wrap">
            <table className="eduos-admin-table">
              <thead>
                <tr>
                  <th>Institution</th>
                  <th className="eduos-admin-table__nowrap">Subdomain</th>
                  <th className="eduos-admin-table__nowrap">Plan</th>
                  <th className="eduos-admin-table__nowrap">Type</th>
                  <th>City</th>
                  <th className="eduos-admin-table__nowrap">Branches</th>
                  <th className="eduos-admin-table__nowrap">Students</th>
                  <th className="eduos-admin-table__nowrap">Annual fee</th>
                  <th className="eduos-admin-table__nowrap">Billing</th>
                  <th className="eduos-admin-table__nowrap">Status</th>
                  <th className="eduos-admin-table__nowrap">Sessions</th>
                  <th className="eduos-admin-table__actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.tenants.map((t) => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 600 }}>
                      <Link href={PLATFORM_OWNER_ROUTES.tenantDetail(t.id)} className="eduos-link">
                        <TruncatedText text={t.name} maxWidth="16rem" />
                      </Link>
                    </td>
                    <td className="eduos-admin-table__nowrap">
                      <code>{t.subdomain}</code>
                    </td>
                    <td className="eduos-admin-table__nowrap">
                      {PLAN_LABEL[t.plan]}
                      {(t.discountPercent ?? 0) > 0 ? (
                        <span
                          style={{
                            display: "block",
                            fontSize: "0.75rem",
                            color: "var(--eduos-success, #1a5f4a)",
                            marginTop: "0.15rem",
                          }}
                        >
                          {t.discountPercent}% discount
                        </span>
                      ) : null}
                    </td>
                    <td className="eduos-admin-table__nowrap" style={{ textTransform: "capitalize" }}>
                      {t.institutionType}
                    </td>
                    <td>
                      {t.city}, {t.state}
                    </td>
                    <td className="eduos-admin-table__nowrap">{t.branchCount}</td>
                    <td className="eduos-admin-table__nowrap">{t.studentCount}</td>
                    <td className="eduos-admin-table__nowrap">
                      {formatInr(t.annualSubscriptionInr ?? 0)}
                    </td>
                    <td className="eduos-admin-table__nowrap">
                      {t.billingStatus ? (
                        <PlatformBillingStatusTag status={t.billingStatus} />
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="eduos-admin-table__nowrap">
                      <PlatformStatusTag status={t.status} />
                    </td>
                    <td className="eduos-admin-table__nowrap">{t.activeSessions}</td>
                    <td className="eduos-admin-table__actions">
                      <div className="eduos-portal-toolbar">
                        {t.status === "active" ? (
                          <Button
                            type="button"
                            variant="secondary"
                            className="eduos-admin-btn-sm"
                            onClick={() => toggleStatus(t)}
                          >
                            Deactivate
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            className="eduos-admin-btn-sm"
                            onClick={() => toggleStatus(t)}
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
        <p className="eduos-section-desc" style={{ marginBottom: 0, marginTop: "1rem" }}>
          Deactivating a tenant ends all institution user sessions within 60 seconds.
        </p>
      </section>
    </PlatformOwnerShell>
  );
}
