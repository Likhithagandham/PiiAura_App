"use client";

import Link from "next/link";
import { useState } from "react";
import type { PlatformIntegrationHealthData } from "@eduos/types";
import { PLATFORM_OWNER_ROUTES } from "@eduos/constants";
import { Button, SkeletonText, TruncatedText } from "@eduos/ui";
import { PlatformIntegrationHealthTag } from "@/components/platform-owner/PlatformIntegrationHealthTag";
import { PlatformOwnerShell } from "@/components/platform-owner/PlatformOwnerShell";
import { ApiError } from "@/lib/api-client";
import { useApiData } from "@/lib/queries";

export default function PlatformIntegrationsPage() {
  const [refreshing, setRefreshing] = useState(false);

  const {
    data,
    error: queryError,
    refetch,
  } = useApiData<PlatformIntegrationHealthData>("/api/platform-owner/integrations/health");
  const error = queryError
    ? queryError instanceof ApiError
      ? queryError.message
      : "Failed to load integration health"
    : null;

  async function refresh() {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }

  return (
    <PlatformOwnerShell title="Integration health">
      {error ? <p className="eduos-admin-message eduos-admin-message--error">{error}</p> : null}

      <header className="eduos-page-header">
        <div>
          <p className="eduos-lead" style={{ margin: 0 }}>
            Live connectivity checks for Razorpay (payments), MSG91 (SMS), and S3 (files)
            per tenant.
          </p>
        </div>
        <div className="eduos-panel__actions">
          <Button type="button" variant="secondary" disabled={refreshing} onClick={refresh}>
            {refreshing ? "Checking…" : "Re-check all"}
          </Button>
        </div>
      </header>

      {!data ? (
        <SkeletonText lines={4} />
      ) : (
        <>
          <div className="eduos-admin-stat-grid">
            <article className="eduos-kpi eduos-kpi--compact">
              <div className="eduos-kpi__label">Healthy checks</div>
              <div className="eduos-kpi__value eduos-kpi__value--md">{data.stats.healthy}</div>
            </article>
            <article className="eduos-kpi eduos-kpi--compact">
              <div className="eduos-kpi__label">Degraded</div>
              <div className="eduos-kpi__value eduos-kpi__value--md">{data.stats.degraded}</div>
            </article>
            <article className="eduos-kpi eduos-kpi--compact">
              <div className="eduos-kpi__label">Down</div>
              <div className="eduos-kpi__value eduos-kpi__value--md">{data.stats.down}</div>
            </article>
            <article className="eduos-kpi eduos-kpi--compact">
              <div className="eduos-kpi__label">Not configured</div>
              <div className="eduos-kpi__value eduos-kpi__value--md">
                {data.stats.notConfigured}
              </div>
            </article>
          </div>

          <p className="eduos-body-sm" style={{ margin: 0 }}>
            Last checked {new Date(data.checkedAt).toLocaleString()}. Demo: Horizon (Razorpay
            degraded), Lakeside (MSG91 down), Coast (S3 down).
          </p>

          <section className="eduos-panel">
            <h2 className="eduos-section-title">Per-tenant status</h2>
            <div className="eduos-table-wrap">
              <table className="eduos-admin-table">
                <thead>
                  <tr>
                    <th>Institution</th>
                    <th className="eduos-admin-table__nowrap">Razorpay</th>
                    <th className="eduos-admin-table__nowrap">MSG91</th>
                    <th className="eduos-admin-table__nowrap">S3</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((row) => (
                    <tr key={row.tenantId}>
                      <td style={{ fontWeight: 600 }}>
                        <Link
                          href={PLATFORM_OWNER_ROUTES.tenantDetail(row.tenantId)}
                          className="eduos-link"
                        >
                          <TruncatedText text={row.tenantName} maxWidth="16rem" />
                        </Link>
                        <div style={{ fontSize: "0.75rem", color: "var(--eduos-text-muted)" }}>
                          <code>{row.subdomain}</code> · {row.city}
                        </div>
                      </td>
                      <td className="eduos-admin-table__nowrap">
                        <PlatformIntegrationHealthTag check={row.razorpay} />
                      </td>
                      <td className="eduos-admin-table__nowrap">
                        <PlatformIntegrationHealthTag check={row.msg91} />
                      </td>
                      <td className="eduos-admin-table__nowrap">
                        <PlatformIntegrationHealthTag check={row.s3} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </PlatformOwnerShell>
  );
}
