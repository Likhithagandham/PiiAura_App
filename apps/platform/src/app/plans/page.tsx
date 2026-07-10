"use client";

import { useEffect, useState } from "react";
import type {
  PlatformChangePlanResult,
  PlatformPlansData,
  PlatformTenantPlan,
  PlatformTenantPlanRow,
} from "@eduos/types";
import { Button, SkeletonTable, TruncatedText } from "@eduos/ui";
import { PlatformOwnerShell } from "@/components/platform-owner/PlatformOwnerShell";
import { platformFetch } from "@/lib/platform-owner/fetch";
import { ApiError } from "@/lib/api-client";
import { useApiData } from "@/lib/queries";

const PLAN_LABEL: Record<PlatformTenantPlan, string> = {
  standard: "Standard ERP",
  ai: "AI ERP",
};

function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function PlatformPlansPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pendingPlan, setPendingPlan] = useState<Record<string, PlatformTenantPlan>>({});

  const {
    data,
    error: queryError,
    refetch,
  } = useApiData<PlatformPlansData>("/api/platform-owner/plans");
  const loadError = queryError
    ? queryError instanceof ApiError
      ? queryError.message
      : "Failed to load plans"
    : null;
  const error = actionError ?? loadError;

  useEffect(() => {
    if (!data) return;
    const next: Record<string, PlatformTenantPlan> = {};
    for (const row of data.tenants) {
      next[row.tenantId] = row.currentPlan;
    }
    setPendingPlan(next);
  }, [data]);

  async function applyPlan(row: PlatformTenantPlanRow) {
    const newPlan = pendingPlan[row.tenantId];
    if (!newPlan || newPlan === row.currentPlan) return;

    setBusyId(row.tenantId);
    setMessage(null);
    setActionError(null);
    try {
      const res = await platformFetch("/api/platform-owner/plans", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId: row.tenantId, newPlan }),
      });
      if (res.status === 401) return;
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as { error?: string }).error ?? "Failed to update plan");
      setMessage((json as PlatformChangePlanResult).message ?? "Plan updated");
      await refetch();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed to update plan");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <PlatformOwnerShell title="Plans">
      {error ? <p className="eduos-admin-message eduos-admin-message--error">{error}</p> : null}
      {message ? <p className="eduos-admin-message">{message}</p> : null}

      <p className="eduos-lead" style={{ margin: 0 }}>
        Two plans only: <strong>Standard ERP</strong> includes every core module with no caps.{" "}
        <strong>AI ERP</strong> adds AI capabilities with per-student credit metering.
      </p>

      {!data && !error ? (
        <SkeletonTable columns={4} rows={5} />
      ) : !data ? null : (
        <>
          <section className="eduos-panel">
            <h2 className="eduos-section-title">Plan catalog</h2>
            <p className="eduos-section-desc">
              List pricing per enrolled student per year. Core ERP is never module-gated.
            </p>
            <div className="eduos-table-wrap">
              <table className="eduos-admin-table">
                <thead>
                  <tr>
                    <th>Plan</th>
                    <th className="eduos-admin-table__nowrap">Price / student / year</th>
                    <th className="eduos-admin-table__nowrap">AI included</th>
                    <th className="eduos-admin-table__nowrap">AI credits / student</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {data.catalog.map((p) => (
                    <tr key={p.plan}>
                      <td style={{ fontWeight: 600 }}>{p.label}</td>
                      <td className="eduos-admin-table__nowrap">
                        {formatInr(p.pricePerStudentInr)}
                      </td>
                      <td className="eduos-admin-table__nowrap">{p.includesAi ? "Yes" : "—"}</td>
                      <td className="eduos-admin-table__nowrap">
                        {p.includedAiCreditsPerStudent > 0
                          ? p.includedAiCreditsPerStudent
                          : "—"}
                      </td>
                      <td>{p.description ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="eduos-panel">
            <h2 className="eduos-section-title">Tenant plans</h2>
            <p className="eduos-section-desc">
              Switch tenants between Standard and AI ERP. Downgrading to Standard disables AI
              features only — branches and students are never capped.
            </p>
            <div className="eduos-table-wrap">
              <table className="eduos-admin-table">
                <thead>
                  <tr>
                    <th>Institution</th>
                    <th className="eduos-admin-table__nowrap">Usage</th>
                    <th className="eduos-admin-table__nowrap">Current</th>
                    <th className="eduos-admin-table__nowrap">New plan</th>
                    <th>On downgrade</th>
                    <th className="eduos-admin-table__actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.tenants.map((row) => {
                    const selected = pendingPlan[row.tenantId] ?? row.currentPlan;
                    const changed = selected !== row.currentPlan;
                    const isAiDowngrade =
                      changed && row.currentPlan === "ai" && selected === "standard";
                    return (
                      <tr key={row.tenantId}>
                        <td style={{ fontWeight: 600 }}>
                          <TruncatedText text={row.tenantName} maxWidth="16rem" />
                          <div style={{ fontSize: "0.75rem", color: "var(--eduos-text-muted)" }}>
                            <code>{row.subdomain}</code>
                          </div>
                        </td>
                        <td className="eduos-admin-table__nowrap">
                          {row.branchCount} branches · {row.studentCount} students
                        </td>
                        <td className="eduos-admin-table__nowrap">
                          {PLAN_LABEL[row.currentPlan]}
                        </td>
                        <td className="eduos-admin-table__nowrap">
                          <select
                            className="eduos-input eduos-input--field"
                            value={selected}
                            onChange={(e) =>
                              setPendingPlan((p) => ({
                                ...p,
                                [row.tenantId]: e.target.value as PlatformTenantPlan,
                              }))
                            }
                            style={{ minWidth: "9rem" }}
                          >
                            {(Object.keys(PLAN_LABEL) as PlatformTenantPlan[]).map((plan) => (
                              <option key={plan} value={plan}>
                                {PLAN_LABEL[plan]}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          {isAiDowngrade ? (
                            <span style={{ fontSize: "0.8125rem" }}>AI features disabled</span>
                          ) : row.restrictedFeatures.length > 0 ? (
                            <span style={{ fontSize: "0.8125rem" }}>
                              {row.restrictedFeatures.join(", ")}
                            </span>
                          ) : (
                            <span style={{ color: "var(--eduos-text-muted)", fontSize: "0.8125rem" }}>
                              —
                            </span>
                          )}
                        </td>
                        <td className="eduos-admin-table__actions">
                          <Button
                            type="button"
                            className="eduos-admin-btn-sm"
                            disabled={!changed || busyId === row.tenantId}
                            onClick={() => applyPlan(row)}
                          >
                            {busyId === row.tenantId ? "Saving…" : "Apply"}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </PlatformOwnerShell>
  );
}
