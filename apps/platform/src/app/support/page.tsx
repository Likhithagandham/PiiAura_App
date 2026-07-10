"use client";

import { useEffect, useState } from "react";
import type { PlatformSupportModeData } from "@eduos/types";
import Link from "next/link";
import { PLATFORM_OWNER_ROUTES } from "@eduos/constants";
import { Button, EmptyState, SkeletonTable, TruncatedText } from "@eduos/ui";
import { usePlatformSupport } from "@/lib/platform-owner/support-context";
import { PlatformOwnerShell } from "@/components/platform-owner/PlatformOwnerShell";
import { ApiError, apiSend } from "@/lib/api-client";
import { useApiData } from "@/lib/queries";

const INSTITUTION_ORIGIN =
  typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:3000`
    : "http://localhost:3000";

export default function PlatformSupportPage() {
  return (
    <PlatformOwnerShell title="Support mode">
      <PlatformSupportPageContent />
    </PlatformOwnerShell>
  );
}

function PlatformSupportPageContent() {
  const { refresh: refreshSupportBanner } = usePlatformSupport();
  const [message, setMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState("");
  const [readOnly, setReadOnly] = useState(true);
  const [busy, setBusy] = useState(false);

  const {
    data,
    error: queryError,
    refetch,
  } = useApiData<PlatformSupportModeData>("/api/platform-owner/support");
  const loadError = queryError
    ? queryError instanceof ApiError
      ? queryError.message
      : "Failed to load"
    : null;
  const error = actionError ?? loadError;

  useEffect(() => {
    if (!tenantId && data?.tenants[0]?.id) {
      setTenantId(data.tenants[0]!.id);
    }
  }, [data, tenantId]);

  async function enterSupport() {
    if (!tenantId) return;
    setBusy(true);
    setMessage(null);
    setActionError(null);
    try {
      const json = await apiSend<{ message?: string }>("/api/platform-owner/support", "POST", {
        tenantId,
        readOnly,
      });
      setMessage(json.message ?? "Support mode started");
      await refreshSupportBanner();
      await refetch();
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : "Failed to enter");
    } finally {
      setBusy(false);
    }
  }

  async function exitSupport() {
    setBusy(true);
    setMessage(null);
    setActionError(null);
    try {
      const json = await apiSend<{ message?: string }>("/api/platform-owner/support", "DELETE");
      setMessage(json.message ?? "Exited support mode");
      await refreshSupportBanner();
      await refetch();
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : "Failed to exit");
    } finally {
      setBusy(false);
    }
  }

  const active = data?.session;
  const tenantUrl = active
    ? `${INSTITUTION_ORIGIN}/login`
    : null;

  return (
    <>
      {error ? <p className="eduos-admin-message eduos-admin-message--error">{error}</p> : null}
      {message ? <p className="eduos-admin-message">{message}</p> : null}

      <section className="eduos-panel">
        <div className="eduos-panel__header">
          <div>
            <h2 className="eduos-section-title">Enter tenant environment</h2>
            <p className="eduos-section-desc">
              Switch into any tenant to troubleshoot. Read-only mode is recommended; every
              action is recorded in SupportModeLog and AuditLog (see audit page).
            </p>
          </div>
        </div>

        {active ? (
          <div className="eduos-alert-banner" style={{ marginBottom: "1rem" }}>
            <div>
              <strong>Active:</strong> {active.tenantName} (
              <code>{active.tenantSubdomain}</code>) —{" "}
              {active.readOnly ? "read-only" : "full access"} since{" "}
              {new Date(active.enteredAt).toLocaleString()}
            </div>
          </div>
        ) : null}

        {!active ? (
          <div className="eduos-filter-grid" style={{ maxWidth: "36rem" }}>
            <label className="eduos-filter-grid__label">
              Tenant
              <select
                className="eduos-input eduos-input--field"
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
              >
                <option value="">Select tenant…</option>
                {(data?.tenants ?? [])
                  .filter((t) => t.status !== "inactive")
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.subdomain})
                    </option>
                  ))}
              </select>
            </label>
            <label
              className="eduos-filter-grid__label"
              style={{ flexDirection: "row", alignItems: "center", gap: "0.5rem" }}
            >
              <input
                type="checkbox"
                checked={readOnly}
                onChange={(e) => setReadOnly(e.target.checked)}
              />
              Read-only (recommended)
            </label>
          </div>
        ) : null}

        <div className="eduos-panel__actions" style={{ marginTop: "1rem" }}>
          {!active ? (
            <Button type="button" onClick={enterSupport} disabled={busy || !tenantId}>
              {busy ? "Starting…" : "Enter support mode"}
            </Button>
          ) : (
            <>
              {tenantUrl ? (
                <a
                  href={tenantUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="eduos-link"
                  style={{ alignSelf: "center", fontSize: "0.875rem" }}
                >
                  Open institution portal ↗
                </a>
              ) : null}
              <Button type="button" variant="secondary" onClick={exitSupport} disabled={busy}>
                {busy ? "Exiting…" : "Exit support mode"}
              </Button>
            </>
          )}
        </div>
      </section>

      <section className="eduos-panel">
        <div className="eduos-panel__header">
          <div>
            <h2 className="eduos-section-title">SupportModeLog (preview)</h2>
            <p className="eduos-section-desc">
              Recent support-mode entries. Full SupportModeLog + AuditLog on the audit page.
            </p>
          </div>
          <Link href={PLATFORM_OWNER_ROUTES.audit} className="eduos-link">
            Full audit log
          </Link>
        </div>
        {!data ? (
          <SkeletonTable columns={5} rows={5} />
        ) : data.supportModeLog.length === 0 ? (
          <EmptyState
            compact
            title="No support-mode entries"
            description="Entering support mode for a tenant will log activity here."
          />
        ) : (
          <div className="eduos-table-wrap">
            <table className="eduos-admin-table">
              <thead>
                <tr>
                  <th className="eduos-admin-table__nowrap">Time</th>
                  <th>Tenant</th>
                  <th>Action</th>
                  <th>Detail</th>
                  <th className="eduos-admin-table__nowrap">Mode</th>
                </tr>
              </thead>
              <tbody>
                {data.supportModeLog.slice(0, 8).map((row) => (
                  <tr key={row.id}>
                    <td className="eduos-admin-table__nowrap">
                      {new Date(row.createdAt).toLocaleString()}
                    </td>
                    <td>
                      <code>{row.tenantSubdomain}</code>
                    </td>
                    <td className="eduos-admin-table__nowrap">
                      <code>{row.action}</code>
                    </td>
                    <td>
                      <TruncatedText text={row.detail} maxWidth="16rem" />
                    </td>
                    <td className="eduos-admin-table__nowrap">
                      {row.readOnly ? "Read-only" : "Full"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
