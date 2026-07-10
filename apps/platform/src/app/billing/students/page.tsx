"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type {
  PlatformStudentSubscriptionListData,
  PlatformStudentSubscriptionListFilters,
  PlatformStudentSubscriptionRow,
  PlatformStudentSubscriptionStatus,
  PlatformTenantPlan,
} from "@eduos/types";
import { PLATFORM_OWNER_ROUTES } from "@eduos/constants";
import {
  Button,
  EmptyState,
  IconCheckCircle,
  IconRupee,
  IconUsers,
  IconWallet,
  SkeletonTable,
  StatCard,
  TruncatedText,
} from "@eduos/ui";
import { PlatformOwnerShell } from "@/components/platform-owner/PlatformOwnerShell";
import { PlatformStudentSubscriptionStatusTag } from "@/components/platform-owner/PlatformStudentSubscriptionStatusTag";
import { ApiError, apiSend } from "@/lib/api-client";
import { useApiData } from "@/lib/queries";

const PLAN_LABEL: Record<PlatformTenantPlan, string> = {
  standard: "Standard ERP",
  ai: "AI ERP",
};

function formatInr(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString();
}

function parseFilters(params: URLSearchParams): PlatformStudentSubscriptionListFilters {
  return {
    tenantId: params.get("tenantId") ?? undefined,
    branchId: params.get("branchId") ?? undefined,
    plan: (params.get("plan") as PlatformTenantPlan | "all" | null) ?? "all",
    status: (params.get("status") as PlatformStudentSubscriptionStatus | "all" | null) ?? "all",
    q: params.get("q") ?? undefined,
    page: Number(params.get("page") ?? "1") || 1,
    pageSize: Number(params.get("pageSize") ?? "50") || 50,
  };
}

function filtersToQuery(filters: PlatformStudentSubscriptionListFilters): string {
  const p = new URLSearchParams();
  if (filters.tenantId) p.set("tenantId", filters.tenantId);
  if (filters.branchId) p.set("branchId", filters.branchId);
  if (filters.plan && filters.plan !== "all") p.set("plan", filters.plan);
  if (filters.status && filters.status !== "all") p.set("status", filters.status);
  if (filters.q) p.set("q", filters.q);
  p.set("page", String(filters.page ?? 1));
  p.set("pageSize", String(filters.pageSize ?? 50));
  return p.toString();
}

export default function PlatformStudentSubscriptionsPage() {
  return (
    <Suspense>
      <PlatformStudentSubscriptionsInner />
    </Suspense>
  );
}

function PlatformStudentSubscriptionsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [actionError, setActionError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [searchDraft, setSearchDraft] = useState(searchParams.get("q") ?? "");

  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);
  const queryString = useMemo(() => filtersToQuery(filters), [filters]);

  // Fingerprint of filters WITHOUT page/pageSize — used to detect page-only changes.
  const filterKey = useMemo(() => {
    const { page: _p, pageSize: _ps, ...rest } = filters;
    return JSON.stringify(rest);
  }, [filters]);
  // Page-only change: skip re-fetching filterOptions/stats from the server by
  // appending &skipMeta=1 — the full URL (with or without skipMeta) is the
  // TanStack Query cache key, so each variant caches independently.
  // Tracked as state (updated during render, React's supported alternative to
  // a ref write in an effect) rather than a ref, since refs may not be read
  // during render.
  const [prevFilterKey, setPrevFilterKey] = useState<string | null>(null);
  const pageOnlyChange = prevFilterKey !== null && filterKey === prevFilterKey;
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
  }

  const requestPath = `/api/platform-owner/student-subscriptions?${queryString}${pageOnlyChange ? "&skipMeta=1" : ""}`;

  const {
    data: rawData,
    error: queryError,
    refetch,
  } = useApiData<Partial<PlatformStudentSubscriptionListData>>(requestPath);
  const loadError = queryError
    ? queryError instanceof ApiError
      ? queryError.message
      : "Failed to load student subscriptions"
    : null;
  const error = actionError ?? loadError;

  // skipMeta responses omit filterOptions/stats — keep the last full (non-skipMeta)
  // metadata around (as state, updated during render) and merge it back in so
  // the filter dropdowns and stat cards don't blank out on simple pagination.
  const [lastMeta, setLastMeta] = useState<{
    filterOptions: PlatformStudentSubscriptionListData["filterOptions"];
    stats: PlatformStudentSubscriptionListData["stats"];
  } | null>(null);
  if (rawData?.filterOptions && rawData?.stats && rawData.filterOptions !== lastMeta?.filterOptions) {
    setLastMeta({ filterOptions: rawData.filterOptions, stats: rawData.stats });
  }

  const data: PlatformStudentSubscriptionListData | null = useMemo(() => {
    if (!rawData) return null;
    const filterOptions = rawData.filterOptions ?? lastMeta?.filterOptions;
    const stats = rawData.stats ?? lastMeta?.stats;
    if (!rawData.rows || !rawData.pagination || !filterOptions || !stats) return null;
    return { rows: rawData.rows, pagination: rawData.pagination, filterOptions, stats };
  }, [rawData, lastMeta]);

  const branchOptions = useMemo(() => {
    const all = data?.filterOptions.branches ?? [];
    if (!filters.tenantId) return all;
    return all.filter((b) => b.tenantId === filters.tenantId);
  }, [data?.filterOptions.branches, filters.tenantId]);

  useEffect(() => {
    setSearchDraft(filters.q ?? "");
  }, [filters.q]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const next = searchDraft.trim();
      if (next === (filters.q ?? "")) return;
      const p = new URLSearchParams(searchParams.toString());
      if (next) p.set("q", next);
      else p.delete("q");
      p.set("page", "1");
      router.replace(`${PLATFORM_OWNER_ROUTES.studentSubscriptions}?${p.toString()}`);
    }, filters.q || searchDraft ? 300 : 0);
    return () => clearTimeout(timer);
  }, [searchDraft, filters.q, router, searchParams]);

  function updateFilters(patch: Partial<PlatformStudentSubscriptionListFilters>) {
    const next = { ...filters, ...patch, page: patch.page ?? 1 };
    if (patch.tenantId !== undefined && patch.tenantId !== filters.tenantId) {
      next.branchId = undefined;
    }
    router.replace(`${PLATFORM_OWNER_ROUTES.studentSubscriptions}?${filtersToQuery(next)}`);
  }

  async function applyAction(row: PlatformStudentSubscriptionRow, action: "mark_paid" | "mark_unpaid") {
    setBusyId(row.id);
    setMessage(null);
    setActionError(null);
    try {
      await apiSend<{ message?: string }>("/api/platform-owner/student-subscriptions/actions", "PATCH", {
        studentSubscriptionId: row.id,
        action,
      });
      setMessage(action === "mark_paid" ? "Marked as paid." : "Marked as unpaid.");
      await refetch();
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : "Action failed");
    } finally {
      setBusyId(null);
    }
  }

  const pagination = data?.pagination;

  return (
    <PlatformOwnerShell title="Student subscriptions">
      <p className="eduos-lead" style={{ margin: 0 }}>
        Per-student annual platform fees across all tenants and branches. Filter by institution,
        branch, or payment status.
      </p>

      {error ? <p className="eduos-admin-message eduos-admin-message--error">{error}</p> : null}
      {message ? <p className="eduos-admin-message">{message}</p> : null}

      {!data ? (
        <SkeletonTable rows={6} columns={10} label="Loading student subscriptions…" />
      ) : (
        <>
          <div className="eduos-admin-stat-grid">
            <StatCard label="Students" value={data.stats.totalStudents} icon={<IconUsers />} accent="#2563eb" />
            <StatCard label="Paid" value={data.stats.paid} icon={<IconCheckCircle />} accent="#1a5f4a" />
            <StatCard label="Unpaid" value={data.stats.unpaid} icon={<IconWallet />} accent="#d69e2e" />
            <StatCard
              label="Collected"
              value={formatInr(data.stats.collectedSubscriptionInr)}
              icon={<IconRupee />}
              accent="#1a5f4a"
            />
            <StatCard
              label="Annual total"
              value={formatInr(data.stats.annualSubscriptionInr)}
              icon={<IconWallet />}
              accent="#7c3aed"
            />
          </div>

          <section className="eduos-panel">
            <h2 className="eduos-section-title">Filters</h2>
            <div className="eduos-filter-grid">
              <label className="eduos-filter-grid__label">
                Search
                <input
                  className="eduos-input eduos-input--field"
                  value={searchDraft}
                  onChange={(e) => setSearchDraft(e.target.value)}
                  placeholder="Student name or login ID"
                />
              </label>
              <label className="eduos-filter-grid__label">
                Tenant
                <select
                  className="eduos-input eduos-input--field"
                  value={filters.tenantId ?? ""}
                  onChange={(e) =>
                    updateFilters({ tenantId: e.target.value || undefined })
                  }
                >
                  <option value="">All tenants</option>
                  {data.filterOptions.tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="eduos-filter-grid__label">
                Branch
                <select
                  className="eduos-input eduos-input--field"
                  value={filters.branchId ?? ""}
                  onChange={(e) =>
                    updateFilters({ branchId: e.target.value || undefined })
                  }
                >
                  <option value="">All branches</option>
                  {branchOptions.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="eduos-filter-grid__label">
                Plan
                <select
                  className="eduos-input eduos-input--field"
                  value={filters.plan ?? "all"}
                  onChange={(e) =>
                    updateFilters({
                      plan: e.target.value as PlatformStudentSubscriptionListFilters["plan"],
                    })
                  }
                >
                  <option value="all">All plans</option>
                  <option value="standard">Standard ERP</option>
                  <option value="ai">AI ERP</option>
                </select>
              </label>
              <label className="eduos-filter-grid__label">
                Payment status
                <select
                  className="eduos-input eduos-input--field"
                  value={filters.status ?? "all"}
                  onChange={(e) =>
                    updateFilters({
                      status: e.target.value as PlatformStudentSubscriptionListFilters["status"],
                    })
                  }
                >
                  <option value="all">All statuses</option>
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                  <option value="overdue">Overdue</option>
                  <option value="waived">Waived</option>
                </select>
              </label>
            </div>
          </section>

          <section className="eduos-panel">
            <div className="eduos-panel__header">
              <div>
                <h2 className="eduos-section-title">Roster</h2>
                <p className="eduos-section-desc">
                  {pagination
                    ? `Showing page ${pagination.page} of ${pagination.totalPages} (${pagination.total} students)`
                    : ""}
                </p>
              </div>
            </div>

            {data.rows.length === 0 ? (
              <EmptyState
                title="No students match these filters"
                description="Try widening filters or clear the search box."
              />
            ) : (
              <div className="eduos-table-wrap">
                <table className="eduos-admin-table">
                  <thead>
                    <tr>
                      <th>Tenant</th>
                      <th className="eduos-admin-table__nowrap">Branch</th>
                      <th>Student</th>
                      <th className="eduos-admin-table__nowrap">Login ID</th>
                      <th className="eduos-admin-table__nowrap">Plan</th>
                      <th className="eduos-admin-table__nowrap">Annual fee</th>
                      <th className="eduos-admin-table__nowrap">Status</th>
                      <th className="eduos-admin-table__nowrap">Paid on</th>
                      <th className="eduos-admin-table__actions">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.rows.map((row) => (
                      <tr key={row.id}>
                        <td>
                          <Link
                            href={PLATFORM_OWNER_ROUTES.tenantDetail(row.tenantId)}
                            className="eduos-link"
                          >
                            <TruncatedText text={row.tenantName} maxWidth="12rem" />
                          </Link>
                          <div className="eduos-body-sm" style={{ color: "var(--eduos-text-muted)" }}>
                            <code>{row.subdomain}</code>
                          </div>
                        </td>
                        <td className="eduos-admin-table__nowrap">{row.branchName}</td>
                        <td style={{ fontWeight: 600 }}>
                          <TruncatedText text={row.studentName} maxWidth="12rem" />
                        </td>
                        <td className="eduos-admin-table__nowrap">
                          <code>{row.loginId || "—"}</code>
                        </td>
                        <td className="eduos-admin-table__nowrap">{PLAN_LABEL[row.plan]}</td>
                        <td className="eduos-admin-table__nowrap">{formatInr(row.annualFeeInr)}</td>
                        <td className="eduos-admin-table__nowrap">
                          <PlatformStudentSubscriptionStatusTag status={row.status} />
                        </td>
                        <td className="eduos-admin-table__nowrap">{formatDate(row.paidAt)}</td>
                        <td className="eduos-admin-table__actions">
                          {row.status === "paid" ? (
                            <Button
                              type="button"
                              variant="secondary"
                              className="eduos-admin-btn-sm"
                              disabled={busyId === row.id}
                              onClick={() => applyAction(row, "mark_unpaid")}
                            >
                              Mark unpaid
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              className="eduos-admin-btn-sm"
                              disabled={busyId === row.id}
                              onClick={() => applyAction(row, "mark_paid")}
                            >
                              Mark paid
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {pagination && pagination.totalPages > 1 ? (
              <div className="eduos-portal-toolbar" style={{ marginTop: "1rem" }}>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={pagination.page <= 1}
                  onClick={() => updateFilters({ page: pagination.page - 1 })}
                >
                  Previous
                </Button>
                <span className="eduos-body-sm" style={{ color: "var(--eduos-text-muted)" }}>
                  Page {pagination.page} / {pagination.totalPages}
                </span>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => updateFilters({ page: pagination.page + 1 })}
                >
                  Next
                </Button>
                <label className="eduos-body-sm" style={{ marginLeft: "auto" }}>
                  Per page{" "}
                  <select
                    className="eduos-input eduos-input--field"
                    style={{ width: "auto", display: "inline-block" }}
                    value={pagination.pageSize}
                    onChange={(e) =>
                      updateFilters({ pageSize: Number(e.target.value), page: 1 })
                    }
                  >
                    {[25, 50, 100].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            ) : null}
          </section>
        </>
      )}
    </PlatformOwnerShell>
  );
}
