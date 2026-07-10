"use client";

import Link from "next/link";
import type { PlatformAuditData } from "@eduos/types";
import { PLATFORM_OWNER_ROUTES } from "@eduos/constants";
import { EmptyState, SkeletonTable, TruncatedText } from "@eduos/ui";
import { PlatformOwnerShell } from "@/components/platform-owner/PlatformOwnerShell";
import { ApiError } from "@/lib/api-client";
import { useApiData } from "@/lib/queries";

export default function PlatformAuditPage() {
  const { data, error: queryError } = useApiData<PlatformAuditData>("/api/platform-owner/audit");
  const error = queryError
    ? queryError instanceof ApiError
      ? queryError.message
      : "Failed to load audit logs"
    : null;

  return (
    <PlatformOwnerShell title="Audit log">
      {error ? <p className="eduos-admin-message eduos-admin-message--error">{error}</p> : null}

      <p className="eduos-lead" style={{ margin: 0 }}>
        Support-mode actions are stored in <strong>SupportModeLog</strong> and mirrored in
        the platform <strong>AuditLog</strong>. Other platform actions appear in AuditLog only.
      </p>

      {!data && !error ? (
        <SkeletonTable columns={6} rows={5} />
      ) : !data ? null : (
        <>
          <section className="eduos-panel">
            <div className="eduos-panel__header">
              <div>
                <h2 className="eduos-section-title">SupportModeLog</h2>
                <p className="eduos-section-desc">
                  Enter/exit support mode and actions taken while supporting a tenant.
                </p>
              </div>
              <Link href={PLATFORM_OWNER_ROUTES.support} className="eduos-link">
                Support mode
              </Link>
            </div>
            {data.supportModeLog.length === 0 ? (
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
                      <th>Actor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.supportModeLog.map((row) => (
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
                        <td className="eduos-admin-table__nowrap">{row.actorName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="eduos-panel">
            <h2 className="eduos-section-title">AuditLog</h2>
            <p className="eduos-section-desc">
              All platform-owner actions including settings, plans, tenants, tickets, and support.
            </p>
            {data.auditLog.length === 0 ? (
              <EmptyState
                compact
                title="No audit entries"
                description="Platform-owner actions will be recorded here as they happen."
              />
            ) : (
              <div className="eduos-table-wrap">
                <table className="eduos-admin-table">
                  <thead>
                    <tr>
                      <th className="eduos-admin-table__nowrap">Time</th>
                      <th className="eduos-admin-table__nowrap">Category</th>
                      <th>Action</th>
                      <th>Detail</th>
                      <th>Tenant</th>
                      <th>Actor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.auditLog.map((row) => (
                      <tr key={row.id}>
                        <td className="eduos-admin-table__nowrap">
                          {new Date(row.createdAt).toLocaleString()}
                        </td>
                        <td className="eduos-admin-table__nowrap">{row.category}</td>
                        <td className="eduos-admin-table__nowrap">
                          <code>{row.action}</code>
                        </td>
                        <td>
                          <TruncatedText text={row.detail} maxWidth="16rem" />
                        </td>
                        <td>
                          {row.tenantSubdomain ? (
                            <code>{row.tenantSubdomain}</code>
                          ) : (
                            <span style={{ color: "var(--eduos-text-muted)" }}>—</span>
                          )}
                        </td>
                        <td className="eduos-admin-table__nowrap">{row.actorName}</td>
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
