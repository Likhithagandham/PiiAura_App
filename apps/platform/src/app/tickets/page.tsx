"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  PlatformTicket,
  PlatformTicketsData,
  SuperAdminTicketStatus,
} from "@eduos/types";
import { Button, EmptyState, ListSearchBar, SkeletonTable, TruncatedText, filterBySearch } from "@eduos/ui";
import { PlatformOwnerShell } from "@/components/platform-owner/PlatformOwnerShell";
import { ApiError, apiSend } from "@/lib/api-client";
import { useApiData } from "@/lib/queries";

const STATUS_LABEL: Record<SuperAdminTicketStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  waiting_on_institution: "Waiting on institution",
  resolved: "Resolved",
  closed: "Closed",
};

function statusTag(status: SuperAdminTicketStatus) {
  const color =
    status === "resolved" || status === "closed"
      ? "#1a5f4a"
      : status === "waiting_on_institution"
        ? "#d69e2e"
        : "var(--eduos-text-muted)";
  return (
    <span className="eduos-tag" style={{ color }}>
      {STATUS_LABEL[status]}
    </span>
  );
}

export default function PlatformTicketsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tenantFilter, setTenantFilter] = useState<string>("all");
  const [actionError, setActionError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState("");
  const [search, setSearch] = useState("");

  const {
    data,
    error: queryError,
    refetch,
  } = useApiData<PlatformTicketsData>("/api/platform-owner/tickets");
  const loadError = queryError
    ? queryError instanceof ApiError
      ? queryError.message
      : "Failed to load tickets"
    : null;
  const error = actionError ?? loadError;

  useEffect(() => {
    if (!data?.tickets.length) return;
    if (!selectedId || !data.tickets.some((t) => t.id === selectedId)) {
      setSelectedId(data.tickets[0]!.id);
    }
  }, [data, selectedId]);

  const tenants = useMemo(() => {
    if (!data) return [];
    const seen = new Map<string, string>();
    for (const t of data.tickets) {
      seen.set(t.tenantSubdomain, t.tenantName);
    }
    return [...seen.entries()].map(([subdomain, name]) => ({ subdomain, name }));
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    const byTenant =
      tenantFilter === "all"
        ? data.tickets
        : data.tickets.filter((t) => t.tenantSubdomain === tenantFilter);
    return filterBySearch(byTenant, search, (t) => [
      t.id,
      t.title,
      t.tenantName,
      t.tenantSubdomain,
      t.category,
      t.severity,
      t.status,
    ]);
  }, [data, tenantFilter, search]);

  const selected = useMemo<PlatformTicket | null>(() => {
    if (!selectedId) return null;
    return filtered.find((t) => t.id === selectedId) ?? data?.tickets.find((t) => t.id === selectedId) ?? null;
  }, [filtered, data, selectedId]);

  async function updateStatus(status: SuperAdminTicketStatus) {
    if (!selected) return;
    setSaving(true);
    setActionError(null);
    try {
      await apiSend("/api/platform-owner/tickets/actions", "PATCH", {
        tenantSubdomain: selected.tenantSubdomain,
        ticketId: selected.id,
        action: "set_status",
        status,
      });
      await refetch();
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  }

  async function addInternalNote() {
    if (!selected) return;
    const msg = note.trim();
    if (!msg) return;
    setSaving(true);
    setActionError(null);
    try {
      await apiSend("/api/platform-owner/tickets/actions", "PATCH", {
        tenantSubdomain: selected.tenantSubdomain,
        ticketId: selected.id,
        action: "add_internal_note",
        message: msg,
      });
      setNote("");
      await refetch();
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : "Failed to add note");
    } finally {
      setSaving(false);
    }
  }

  return (
    <PlatformOwnerShell title="Support tickets">
      {error ? <p className="eduos-admin-message eduos-admin-message--error">{error}</p> : null}

      <header className="eduos-page-header">
        <p className="eduos-lead" style={{ margin: 0 }}>
          All tickets across tenants. Update status and add internal notes visible to platform
          staff.
        </p>
        <label className="eduos-filter-grid__label" style={{ minWidth: "12rem" }}>
          Tenant
          <select
            className="eduos-input eduos-input--field"
            value={tenantFilter}
            onChange={(e) => {
              setTenantFilter(e.target.value);
              setSelectedId(null);
            }}
          >
            <option value="all">All tenants</option>
            {tenants.map((t) => (
              <option key={t.subdomain} value={t.subdomain}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
      </header>

      <section className="eduos-panel">
        {!data ? (
          <SkeletonTable columns={4} rows={5} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No tickets in this view"
            description="No tickets match your filters or search."
          />
        ) : (
          <div className="eduos-platform-ticket-split">
            <div className="eduos-table-wrap" style={{ marginTop: 0 }}>
              <ListSearchBar
                value={search}
                onChange={setSearch}
                placeholder="Search ticket, tenant, or category…"
                total={
                  tenantFilter === "all"
                    ? data.tickets.length
                    : data.tickets.filter((t) => t.tenantSubdomain === tenantFilter).length
                }
                filtered={filtered.length}
              />
              <table className="eduos-admin-table">
                <thead>
                  <tr>
                    <th className="eduos-admin-table__nowrap">ID</th>
                    <th>Tenant</th>
                    <th>Title</th>
                    <th className="eduos-admin-table__nowrap">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => (
                    <tr
                      key={`${t.tenantSubdomain}-${t.id}`}
                      onClick={() => setSelectedId(t.id)}
                      style={{
                        cursor: "pointer",
                        background:
                          selectedId === t.id ? "var(--eduos-nav-active-bg)" : undefined,
                      }}
                    >
                      <td className="eduos-admin-table__nowrap">
                        <code>{t.id}</code>
                      </td>
                      <td className="eduos-admin-table__nowrap">{t.tenantName}</td>
                      <td style={{ fontWeight: 600 }}>
                        <TruncatedText text={t.title} maxWidth="16rem" />
                      </td>
                      <td className="eduos-admin-table__nowrap">{statusTag(t.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="eduos-platform-ticket-detail">
              {!selected ? (
                <EmptyState
                  compact
                  title="No ticket selected"
                  description="Select a ticket from the list to view its details."
                />
              ) : (
                <>
                  <div className="eduos-panel__header" style={{ marginBottom: "0.75rem" }}>
                    <div>
                      <h2 className="eduos-subsection-title">{selected.title}</h2>
                      <p className="eduos-section-desc" style={{ marginBottom: 0 }}>
                        <code>{selected.id}</code> · {selected.tenantName} · {selected.category}{" "}
                        · {selected.severity}
                      </p>
                    </div>
                    {statusTag(selected.status)}
                  </div>
                  <p className="eduos-lead" style={{ marginBottom: "0.75rem" }}>
                    {selected.description}
                  </p>
                  <div className="eduos-portal-toolbar" style={{ marginBottom: "0.75rem" }}>
                    <label className="eduos-filter-grid__label" style={{ flex: 1 }}>
                      Update status
                      <select
                        className="eduos-input eduos-input--field"
                        value={selected.status}
                        onChange={(e) =>
                          updateStatus(e.target.value as SuperAdminTicketStatus)
                        }
                        disabled={saving}
                      >
                        {(Object.keys(STATUS_LABEL) as SuperAdminTicketStatus[]).map((s) => (
                          <option key={s} value={s}>
                            {STATUS_LABEL[s]}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <h3 className="eduos-subsection-title">Internal notes</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {selected.comments
                      .filter((c) => c.authorRole === "platform_owner")
                      .map((c) => (
                        <div
                          key={c.id}
                          style={{
                            border: "1px solid var(--eduos-border)",
                            borderRadius: "var(--eduos-radius)",
                            padding: "0.65rem 0.75rem",
                            fontSize: "0.8125rem",
                          }}
                        >
                          <div style={{ fontWeight: 600 }}>{c.authorName}</div>
                          <div style={{ marginTop: "0.25rem" }}>{c.message}</div>
                          <div
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--eduos-text-muted)",
                              marginTop: "0.25rem",
                            }}
                          >
                            {new Date(c.createdAt).toLocaleString()}
                          </div>
                        </div>
                      ))}
                  </div>
                  <label
                    className="eduos-filter-grid__label"
                    style={{ display: "block", marginTop: "0.75rem" }}
                  >
                    Add internal note
                    <textarea
                      className="eduos-input eduos-input--field"
                      rows={3}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Visible to platform support only…"
                      style={{ width: "100%", maxWidth: "none", marginTop: "0.35rem" }}
                    />
                  </label>
                  <div className="eduos-panel__actions" style={{ marginTop: "0.5rem" }}>
                    <Button
                      type="button"
                      className="eduos-admin-btn-sm"
                      onClick={addInternalNote}
                      disabled={saving || !note.trim()}
                    >
                      {saving ? "Saving…" : "Add note"}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </section>
    </PlatformOwnerShell>
  );
}
