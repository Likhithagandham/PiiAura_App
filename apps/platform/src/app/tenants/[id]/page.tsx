"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import type { PlatformTenantSummary } from "@eduos/types";
import { PLATFORM_OWNER_ROUTES } from "@eduos/constants";
import { Button, SkeletonText } from "@eduos/ui";
import { PlatformOwnerShell } from "@/components/platform-owner/PlatformOwnerShell";
import { ApiError, apiSend } from "@/lib/api-client";
import { useApiData } from "@/lib/queries";

export default function TenantDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const [actionError, setActionError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const {
    data,
    error: queryError,
    refetch,
  } = useApiData<{ tenant: PlatformTenantSummary }>(id ? `/api/platform-owner/tenants/${id}` : null);
  const tenant = data?.tenant ?? null;
  const loadError = queryError
    ? queryError instanceof ApiError
      ? queryError.message
      : "Failed to load tenant"
    : null;
  const error = actionError ?? loadError;

  async function setStatus(action: "activate" | "deactivate") {
    if (!tenant) return;
    setBusy(true);
    setMessage(null);
    setActionError(null);
    try {
      const json = await apiSend<{ message?: string }>("/api/platform-owner/tenants/actions", "PATCH", {
        tenantId: tenant.id,
        action,
      });
      setMessage(json.message ?? "Updated");
      await refetch();
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : "Action failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PlatformOwnerShell title={tenant?.name ?? "Tenant"}>
      <p style={{ marginBottom: "1rem" }}>
        <Link href={PLATFORM_OWNER_ROUTES.tenants}>← All tenants</Link>
      </p>
      {error ? <p className="eduos-admin-message eduos-admin-message--error">{error}</p> : null}
      {message ? (
        <p className="eduos-admin-message eduos-admin-message--success">{message}</p>
      ) : null}
      {!tenant ? (
        <SkeletonText lines={4} />
      ) : (
        <section className="eduos-panel">
          <dl style={{ display: "grid", gap: "0.65rem", fontSize: "0.875rem" }}>
            <div>
              <dt style={{ fontWeight: 600 }}>Subdomain</dt>
              <dd>
                <code>{tenant.subdomain}</code> — institution portal:{" "}
                <code>{tenant.subdomain}.localhost:3000</code>
              </dd>
            </div>
            <div>
              <dt style={{ fontWeight: 600 }}>Status</dt>
              <dd style={{ textTransform: "capitalize" }}>{tenant.status}</dd>
            </div>
            <div>
              <dt style={{ fontWeight: 600 }}>Plan / type</dt>
              <dd>
                {tenant.plan} · {tenant.institutionType}
              </dd>
            </div>
            <div>
              <dt style={{ fontWeight: 600 }}>Location</dt>
              <dd>
                {tenant.city}, {tenant.state}
              </dd>
            </div>
            <div>
              <dt style={{ fontWeight: 600 }}>Super admin</dt>
              <dd>
                {tenant.superAdminName} ({tenant.superAdminPhone})
              </dd>
            </div>
            <div>
              <dt style={{ fontWeight: 600 }}>Usage</dt>
              <dd>
                {tenant.branchCount} branches · {tenant.studentCount} students ·{" "}
                {tenant.activeSessions} active sessions
              </dd>
            </div>
            <div>
              <dt style={{ fontWeight: 600 }}>Subscriptions</dt>
              <dd>
                <Link
                  href={`${PLATFORM_OWNER_ROUTES.studentSubscriptions}?tenantId=${tenant.id}`}
                  className="eduos-link"
                >
                  View student subscription roster
                </Link>
              </dd>
            </div>
            <div>
              <dt style={{ fontWeight: 600 }}>Licensing & billing</dt>
              <dd>
                <Link href={`/billing/${tenant.id}`} className="eduos-link">
                  Manage licenses, record payments, invoices
                </Link>
              </dd>
            </div>
          </dl>

          <div className="eduos-portal-toolbar" style={{ marginTop: "1.25rem" }}>
            {tenant.status === "active" ? (
              <Button
                type="button"
                variant="secondary"
                disabled={busy}
                onClick={() => setStatus("deactivate")}
              >
                Deactivate tenant
              </Button>
            ) : (
              <Button type="button" disabled={busy} onClick={() => setStatus("activate")}>
                Activate tenant
              </Button>
            )}
          </div>
          <p className="eduos-body-sm" style={{ marginTop: "0.75rem", color: "var(--eduos-muted)" }}>
            Deactivating terminates all institution user sessions within 60 seconds.
          </p>
        </section>
      )}
    </PlatformOwnerShell>
  );
}
