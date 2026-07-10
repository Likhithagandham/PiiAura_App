"use client";

import Link from "next/link";
import { useState } from "react";
import type { PlatformTrialsData, PlatformTrialTenantRow } from "@eduos/types";
import { PLATFORM_OWNER_ROUTES } from "@eduos/constants";
import {
  BarChart,
  Button,
  EmptyState,
  IconAlertTriangle,
  IconClock,
  IconHourglass,
  SkeletonText,
  StatCard,
  TruncatedText,
} from "@eduos/ui";
import { PlatformOwnerShell } from "@/components/platform-owner/PlatformOwnerShell";
import { PlatformTrialStageTag } from "@/components/platform-owner/PlatformTrialStageTag";
import { ApiError, apiSend } from "@/lib/api-client";
import { useApiData } from "@/lib/queries";

const PLAN_LABEL = { standard: "Standard ERP", ai: "AI ERP" };

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function PlatformTrialsPage() {
  const [actionError, setActionError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const {
    data,
    error: queryError,
    refetch,
  } = useApiData<PlatformTrialsData>("/api/platform-owner/trials");
  const loadError = queryError
    ? queryError instanceof ApiError
      ? queryError.message
      : "Failed to load trials"
    : null;
  const error = actionError ?? loadError;

  async function trialAction(
    payload:
      | { action: "run_pipeline" }
      | { action: "extend_trial" | "convert_to_paid"; tenantId: string },
  ) {
    const key = "tenantId" in payload ? payload.tenantId : "pipeline";
    setBusy(key);
    setMessage(null);
    setActionError(null);
    try {
      const json = await apiSend<{ message?: string; trials?: PlatformTrialsData }>(
        "/api/platform-owner/trials/actions",
        "POST",
        payload.action === "extend_trial" ? { ...payload, extendDays: 14 } : payload,
      );
      setMessage(json.message ?? "Done");
      await refetch();
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : "Action failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <PlatformOwnerShell title="Trial management">
      {error ? <p className="eduos-admin-message eduos-admin-message--error">{error}</p> : null}
      {message ? <p className="eduos-admin-message">{message}</p> : null}

      <header className="eduos-page-header">
        <div>
          <p className="eduos-lead" style={{ margin: 0 }}>
            Automated pipeline: trial expiry → {data?.pipeline.gracePeriodDays ?? 14}-day
            grace period → tenant deactivation (sessions ended).
          </p>
        </div>
        <div className="eduos-panel__actions">
          <Button
            type="button"
            disabled={busy === "pipeline"}
            onClick={() => trialAction({ action: "run_pipeline" })}
          >
            {busy === "pipeline" ? "Running…" : "Run pipeline now"}
          </Button>
        </div>
      </header>

      {!data ? (
        <SkeletonText lines={4} />
      ) : (
        <>
          <div className="eduos-admin-stat-grid">
            <StatCard
              label="Active trial"
              value={data.stats.active}
              icon={<IconHourglass />}
              accent="#1a5f4a"
            />
            <StatCard
              label="Grace period"
              value={data.stats.grace}
              icon={<IconClock />}
              accent="#d69e2e"
            />
            <StatCard
              label="Past grace (pending deactivate)"
              value={data.stats.lapsed}
              icon={<IconAlertTriangle />}
              accent="#dc2626"
            />
          </div>

          {data.stats.active + data.stats.grace + data.stats.lapsed > 0 ? (
            <section className="eduos-panel">
              <h2 className="eduos-section-title">Pipeline overview</h2>
              <p className="eduos-section-desc">Tenant counts at each stage of the trial lifecycle.</p>
              <BarChart
                data={[
                  { label: "Active trial", value: data.stats.active, color: "#1a5f4a" },
                  { label: "Grace period", value: data.stats.grace, color: "#d69e2e" },
                  { label: "Past grace", value: data.stats.lapsed, color: "#dc2626" },
                ]}
                height={180}
              />
            </section>
          ) : null}

          <section className="eduos-panel">
            <h2 className="eduos-section-title">Pipeline stages</h2>
            <ol className="eduos-body-sm" style={{ margin: 0, paddingLeft: "1.25rem" }}>
              <li>
                <strong>Active trial</strong> — up to {data.pipeline.trialPeriodDays} days from
                signup (configurable per tenant).
              </li>
              <li>
                <strong>Grace period</strong> — {data.pipeline.gracePeriodDays} days after trial
                ends; institution remains active with warnings.
              </li>
              <li>
                <strong>Deactivate</strong> — after grace ends, pipeline sets tenant inactive and
                terminates sessions.
              </li>
            </ol>
          </section>

          <section className="eduos-panel">
            <h2 className="eduos-section-title">Tenants on trial</h2>
            <p className="eduos-section-desc">
              <strong>Coast Public School</strong> is past grace — run the pipeline to deactivate.
              <strong> Valley Charter</strong> is in grace. <strong>Sunrise</strong> is still in
              active trial.
            </p>
            {data.rows.length === 0 ? (
              <EmptyState
                compact
                title="No tenants on trial"
                description="Institutions on trial or in a grace period will appear here."
              />
            ) : (
              <div className="eduos-table-wrap">
                <table className="eduos-admin-table">
                  <thead>
                    <tr>
                      <th>Institution</th>
                      <th className="eduos-admin-table__nowrap">Stage</th>
                      <th className="eduos-admin-table__nowrap">Trial ends</th>
                      <th className="eduos-admin-table__nowrap">Grace ends</th>
                      <th className="eduos-admin-table__nowrap">Remaining</th>
                      <th className="eduos-admin-table__actions">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.rows.map((row) => (
                      <TrialRow
                        key={row.tenantId}
                        row={row}
                        busy={busy === row.tenantId}
                        onExtend={() =>
                          trialAction({ action: "extend_trial", tenantId: row.tenantId })
                        }
                        onConvert={() =>
                          trialAction({ action: "convert_to_paid", tenantId: row.tenantId })
                        }
                      />
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

function TrialRow({
  row,
  busy,
  onExtend,
  onConvert,
}: {
  row: PlatformTrialTenantRow;
  busy: boolean;
  onExtend: () => void;
  onConvert: () => void;
}) {
  const remainingLabel =
    row.daysRemaining != null
      ? row.stage === "active"
        ? `${row.daysRemaining}d trial`
        : `${row.daysRemaining}d grace`
      : "—";

  return (
    <tr>
      <td style={{ fontWeight: 600 }}>
        <Link href={PLATFORM_OWNER_ROUTES.tenantDetail(row.tenantId)} className="eduos-link">
          <TruncatedText text={row.tenantName} maxWidth="16rem" />
        </Link>
        <div style={{ fontSize: "0.75rem", color: "var(--eduos-text-muted)" }}>
          <code>{row.subdomain}</code> · {row.city} · {PLAN_LABEL[row.plan]}
        </div>
      </td>
      <td className="eduos-admin-table__nowrap">
        <PlatformTrialStageTag stage={row.stage} />
      </td>
      <td className="eduos-admin-table__nowrap">{formatDate(row.trialEndsAt)}</td>
      <td className="eduos-admin-table__nowrap">{formatDate(row.graceEndsAt)}</td>
      <td className="eduos-admin-table__nowrap">{remainingLabel}</td>
      <td className="eduos-admin-table__actions">
        <div className="eduos-portal-toolbar">
          <Button
            type="button"
            variant="secondary"
            className="eduos-admin-btn-sm"
            disabled={busy}
            onClick={onExtend}
          >
            Extend +14d
          </Button>
          <Button
            type="button"
            className="eduos-admin-btn-sm"
            disabled={busy}
            onClick={onConvert}
          >
            Convert to paid
          </Button>
        </div>
      </td>
    </tr>
  );
}
