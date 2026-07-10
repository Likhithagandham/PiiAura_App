"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type {
  PlatformAiPlanFeatures,
  PlatformPlanFeatureKey,
  PlatformPlanFeatureMatrixData,
  PlatformTenantPlan,
} from "@eduos/types";
import { PLATFORM_OWNER_ROUTES } from "@eduos/constants";
import { Button, SkeletonTable } from "@eduos/ui";
import { PlatformOwnerShell } from "@/components/platform-owner/PlatformOwnerShell";
import { ApiError, apiSend } from "@/lib/api-client";
import { useApiData } from "@/lib/queries";

const PLANS: PlatformTenantPlan[] = ["standard", "ai"];

export default function PlatformPlanFeaturesPage() {
  const [draft, setDraft] = useState<
    Partial<Record<PlatformTenantPlan, PlatformAiPlanFeatures>>
  >({});
  const [actionError, setActionError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busyPlan, setBusyPlan] = useState<PlatformTenantPlan | null>(null);

  const {
    data,
    error: queryError,
    refetch,
  } = useApiData<PlatformPlanFeatureMatrixData>("/api/platform-owner/plan-features");
  const loadError = queryError
    ? queryError instanceof ApiError
      ? queryError.message
      : "Failed to load feature matrix"
    : null;
  const error = actionError ?? loadError;

  useEffect(() => {
    if (!data) return;
    const next: Partial<Record<PlatformTenantPlan, PlatformAiPlanFeatures>> = {};
    for (const row of data.rows) {
      next[row.plan] = { ...row.flags };
    }
    setDraft(next);
  }, [data]);

  function toggle(plan: PlatformTenantPlan, key: PlatformPlanFeatureKey) {
    setDraft((d) => {
      const current = d[plan];
      if (!current) return d;
      return {
        ...d,
        [plan]: { ...current, [key]: !current[key] },
      };
    });
  }

  async function savePlan(plan: PlatformTenantPlan) {
    const flags = draft[plan];
    if (!flags) return;
    setBusyPlan(plan);
    setMessage(null);
    setActionError(null);
    try {
      await apiSend<PlatformPlanFeatureMatrixData>("/api/platform-owner/plan-features", "PATCH", {
        plan,
        flags,
      });
      setMessage(`Saved ${plan} AI feature flags.`);
      await refetch();
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : "Save failed");
    } finally {
      setBusyPlan(null);
    }
  }

  const labels = data?.featureCatalog ?? [];

  return (
    <PlatformOwnerShell title="AI plan features">
      {error ? <p className="eduos-admin-message eduos-admin-message--error">{error}</p> : null}
      {message ? <p className="eduos-admin-message">{message}</p> : null}

      <header className="eduos-page-header">
        <div>
          <p className="eduos-lead" style={{ margin: 0 }}>
            Configure which AI capabilities are included on the AI ERP plan. Core ERP modules are
            available on every plan — only AI is gated.
          </p>
        </div>
        <Link href={PLATFORM_OWNER_ROUTES.plans} className="eduos-link">
          Tenant plans
        </Link>
      </header>

      {!data ? (
        <SkeletonTable columns={4} rows={5} />
      ) : (
        <section className="eduos-panel">
          <h2 className="eduos-section-title">AI feature flags by plan</h2>
          <p className="eduos-section-desc">
            Standard ERP has no AI. Toggle AI capabilities for the AI ERP tier.
          </p>
          <div className="eduos-table-wrap">
            <table className="eduos-admin-table eduos-plan-feature-matrix">
              <thead>
                <tr>
                  <th>Feature</th>
                  {data.rows.map((row) => (
                    <th key={row.plan} className="eduos-admin-table__nowrap">
                      {row.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {labels.map(({ key, label }) => (
                  <tr key={key}>
                    <td style={{ fontWeight: 600 }}>{label}</td>
                    {PLANS.map((plan) => {
                      const flags = draft[plan];
                      return (
                        <td key={plan} className="eduos-admin-table__nowrap eduos-plan-feature-matrix__cell">
                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "0.35rem",
                              cursor: "pointer",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={flags?.[key] ?? false}
                              onChange={() => toggle(plan, key)}
                            />
                          </label>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td />
                  {PLANS.map((plan) => {
                    const row = data.rows.find((r) => r.plan === plan);
                    return (
                      <td key={plan} className="eduos-admin-table__actions">
                        <Button
                          type="button"
                          className="eduos-admin-btn-sm"
                          disabled={busyPlan === plan}
                          onClick={() => savePlan(plan)}
                        >
                          {busyPlan === plan ? "Saving…" : `Save ${row?.label ?? plan}`}
                        </Button>
                      </td>
                    );
                  })}
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      )}
    </PlatformOwnerShell>
  );
}
