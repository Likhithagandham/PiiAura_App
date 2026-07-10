"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  SuperAdminCreateTicketInput,
  SuperAdminTicket,
  SuperAdminTicketStatus,
  SuperAdminTicketsData,
} from "@eduos/types";
import {
  Button,
  ChartLegend,
  DonutChart,
  EmptyState,
  IconAlertTriangle,
  IconChartBar,
  IconCheckCircle,
  ListSearchBar,
  SkeletonTable,
  StatCard,
  TruncatedText,
  chartColor,
  filterBySearch,
} from "@eduos/ui";
import { SuperAdminShell } from "@/components/super-admin/SuperAdminShell";
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
    <span className="eduos-tag" style={{ borderColor: color, color }}>
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

export default function SuperAdminTicketsPage() {
  // Legacy route: keep working, but prefer the merged Engagement module.
  useEffect(() => {
    window.location.replace("/super-admin/engagement?tab=tickets");
  }, []);
  return <p className="eduos-empty">Redirecting…</p>;
}

export function SuperAdminTicketsView({ embedded = false }: { embedded?: boolean }) {
  const { data, error: queryError, refetch } = useApiData<SuperAdminTicketsData>(
    "/api/super-admin/tickets",
  );
  const load = refetch;
  // Selection defaults to the first ticket until the user clicks a row.
  const [selectedOverride, setSelectedOverride] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [comment, setComment] = useState("");
  const [form, setForm] = useState<SuperAdminCreateTicketInput>({
    title: "",
    category: "bug",
    severity: "medium",
    description: "",
  });
  const [search, setSearch] = useState("");

  const selectedId = selectedOverride ?? data?.tickets[0]?.id ?? null;
  const error = mutationError ?? (queryError ? "Failed to load" : null);

  const filteredTickets = useMemo(
    () =>
      filterBySearch(data?.tickets ?? [], search, (t) => [
        t.id,
        t.title,
        t.category,
        t.severity,
        t.status,
      ]),
    [data?.tickets, search],
  );

  const selected = useMemo<SuperAdminTicket | null>(() => {
    if (!selectedId) return null;
    return filteredTickets.find((t) => t.id === selectedId) ?? data?.tickets.find((t) => t.id === selectedId) ?? null;
  }, [data?.tickets, filteredTickets, selectedId]);

  async function createTicket() {
    setSaving(true);
    setMutationError(null);
    try {
      const res = await fetch("/api/super-admin/tickets", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as { error?: string }).error ?? "Failed to create ticket");
      setForm({ title: "", category: "bug", severity: "medium", description: "" });
      await load();
    } catch (e) {
      setMutationError(e instanceof Error ? e.message : "Failed to create ticket");
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(status: SuperAdminTicketStatus) {
    if (!selected) return;
    setSaving(true);
    setMutationError(null);
    try {
      const res = await fetch("/api/super-admin/tickets/actions", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set_status", ticketId: selected.id, status }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as { error?: string }).error ?? "Failed to update");
      await load();
    } catch (e) {
      setMutationError(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  }

  async function addComment() {
    if (!selected) return;
    const msg = comment.trim();
    if (!msg) return;
    setSaving(true);
    setMutationError(null);
    try {
      const res = await fetch("/api/super-admin/tickets/actions", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add_comment", ticketId: selected.id, message: msg }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as { error?: string }).error ?? "Failed to comment");
      setComment("");
      await load();
    } catch (e) {
      setMutationError(e instanceof Error ? e.message : "Failed to comment");
    } finally {
      setSaving(false);
    }
  }

  const statusDist = data
    ? (Object.keys(STATUS_LABEL) as SuperAdminTicketStatus[])
        .map((status, i) => ({
          status,
          label: STATUS_LABEL[status],
          count: data.tickets.filter((t) => t.status === status).length,
          color: chartColor(i),
        }))
        .filter((s) => s.count > 0)
    : [];
  const openCount = data
    ? data.tickets.filter(
        (t) => t.status === "open" || t.status === "in_progress" || t.status === "waiting_on_institution",
      ).length
    : 0;
  const resolvedCount = data
    ? data.tickets.filter((t) => t.status === "resolved" || t.status === "closed").length
    : 0;

  const body = (
    <>
      {error ? <p className="eduos-admin-message eduos-admin-message--error">{error}</p> : null}

      {data && data.tickets.length > 0 ? (
        <section className="eduos-panel">
          <h2 className="eduos-section-title">Overview</h2>
          <p className="eduos-section-desc">Support tickets by status.</p>
          <div className="eduos-admin-stat-grid" style={{ marginBottom: "1rem" }}>
            <StatCard label="Total" value={data.tickets.length} icon={<IconChartBar />} accent="#2563eb" />
            <StatCard label="Open" value={openCount} icon={<IconAlertTriangle />} accent="#d69e2e" />
            <StatCard label="Resolved" value={resolvedCount} icon={<IconCheckCircle />} accent="#1a5f4a" />
          </div>
          <div className="eduos-chart-split">
            <DonutChart
              data={statusDist.map((s) => ({ label: s.label, value: s.count, color: s.color }))}
              centerValue={data.tickets.length}
              centerLabel="Tickets"
            />
            <div className="eduos-chart-split__legend">
              <ChartLegend
                items={statusDist.map((s) => ({ label: s.label, color: s.color, value: s.count }))}
              />
            </div>
          </div>
        </section>
      ) : null}

      <section className="eduos-panel">
        <h2 className="eduos-section-title">Raise a ticket</h2>
        <p className="eduos-section-desc">Report bugs and track support status/history.</p>
        <div className="eduos-portal-toolbar" style={{ marginTop: "0.5rem" }}>
          <label style={{ fontSize: "0.8125rem", flex: 1, minWidth: 240 }}>
            Title
            <input
              className="eduos-input eduos-input--field"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="Short summary"
              style={{ display: "block", marginTop: "0.2rem" }}
            />
          </label>
          <label style={{ fontSize: "0.8125rem" }}>
            Category
            <select
              className="eduos-input eduos-input--field"
              value={form.category}
              onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as SuperAdminCreateTicketInput["category"] }))}
              style={{ display: "block", marginTop: "0.2rem" }}
            >
              <option value="bug">Bug</option>
              <option value="data_issue">Data issue</option>
              <option value="billing">Billing</option>
              <option value="access">Access</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label style={{ fontSize: "0.8125rem" }}>
            Severity
            <select
              className="eduos-input eduos-input--field"
              value={form.severity}
              onChange={(e) => setForm((p) => ({ ...p, severity: e.target.value as SuperAdminCreateTicketInput["severity"] }))}
              style={{ display: "block", marginTop: "0.2rem" }}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </label>
        </div>
        <label style={{ display: "block", marginTop: "0.5rem", fontSize: "0.8125rem" }}>
          Description
          <textarea
            className="eduos-input eduos-input--field"
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            placeholder="Steps to reproduce, expected vs actual, affected branches, screenshots..."
            rows={4}
            style={{ display: "block", width: "100%", marginTop: "0.2rem" }}
          />
        </label>
        <div className="eduos-portal-toolbar" style={{ marginTop: "0.5rem" }}>
          <Button type="button" className="eduos-admin-btn-sm" onClick={createTicket} disabled={saving}>
            {saving ? "Submitting…" : "Submit ticket"}
          </Button>
        </div>
      </section>

      <section className="eduos-panel">
        <h2 className="eduos-section-title">Tickets</h2>
        {!data ? (
          <SkeletonTable columns={3} rows={5} />
        ) : data.tickets.length === 0 ? (
          <EmptyState title="No tickets yet" description="Raise a ticket to track support requests." />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "minmax(320px, 1fr) 1.25fr", gap: "0.75rem" }}>
            <div className="eduos-table-wrap" style={{ alignSelf: "start" }}>
              <ListSearchBar
                value={search}
                onChange={setSearch}
                placeholder="Search ticket ID, title, or category…"
                total={data.tickets.length}
                filtered={filteredTickets.length}
              />
              <table className="eduos-admin-table">
                <thead>
                  <tr>
                    <th className="eduos-admin-table__nowrap">ID</th>
                    <th>Title</th>
                    <th className="eduos-admin-table__nowrap">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map((t) => (
                    <tr
                      key={t.id}
                      onClick={() => setSelectedOverride(t.id)}
                      style={{
                        cursor: "pointer",
                        background: selectedId === t.id ? "var(--eduos-nav-active-bg)" : undefined,
                      }}
                    >
                      <td className="eduos-admin-table__nowrap">
                        <code>{t.id}</code>
                      </td>
                      <td style={{ fontWeight: 700 }}>
                        <TruncatedText text={t.title} maxWidth="16rem" />
                      </td>
                      <td className="eduos-admin-table__nowrap">{statusTag(t.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ alignSelf: "start" }}>
              {!selected ? (
                <EmptyState compact title="No ticket selected" description="Select a ticket to view details." />
              ) : (
                <div
                  style={{
                    border: "1px solid var(--eduos-border)",
                    borderRadius: "var(--eduos-radius)",
                    background: "var(--eduos-card)",
                    padding: "0.875rem",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: "0.95rem" }}>{selected.title}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--eduos-text-muted)", marginTop: "0.25rem" }}>
                        <code>{selected.id}</code> · {selected.category} · {selected.severity} · last activity{" "}
                        {new Date(selected.lastActivityAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="eduos-portal-toolbar">
                      <select
                        className="eduos-input eduos-input--field"
                        value={selected.status}
                        onChange={(e) => updateStatus(e.target.value as SuperAdminTicketStatus)}
                        disabled={saving}
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In progress</option>
                        <option value="waiting_on_institution">Waiting on institution</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginTop: "0.75rem" }}>
                    <div style={{ fontWeight: 700, fontSize: "0.875rem" }}>Description</div>
                    <div style={{ marginTop: "0.35rem", fontSize: "0.8125rem", color: "var(--eduos-text-muted)", lineHeight: 1.6 }}>
                      {selected.description || "—"}
                    </div>
                  </div>

                  <div style={{ marginTop: "0.75rem" }}>
                    <div style={{ fontWeight: 700, fontSize: "0.875rem" }}>History</div>
                    <div style={{ marginTop: "0.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {selected.comments.map((c) => (
                        <div
                          key={c.id}
                          style={{
                            border: "1px solid var(--eduos-border)",
                            borderRadius: "var(--eduos-radius)",
                            padding: "0.75rem",
                            background: "var(--eduos-bg)",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
                            <div style={{ fontWeight: 700, fontSize: "0.8125rem" }}>
                              {c.authorName}{" "}
                              <span style={{ fontWeight: 500, color: "var(--eduos-text-muted)" }}>
                                ({c.authorRole.replace("_", " ")})
                              </span>
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "var(--eduos-text-muted)" }}>
                              {new Date(c.createdAt).toLocaleString()}
                            </div>
                          </div>
                          <div style={{ marginTop: "0.35rem", fontSize: "0.8125rem", color: "var(--eduos-text-muted)", lineHeight: 1.6 }}>
                            {c.message}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginTop: "0.75rem" }}>
                    <div style={{ fontWeight: 700, fontSize: "0.875rem" }}>Add comment</div>
                    <div className="eduos-portal-toolbar" style={{ marginTop: "0.35rem" }}>
                      <input
                        className="eduos-input eduos-input--field"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Write an update for support…"
                        style={{ flex: 1, minWidth: 240 }}
                      />
                      <Button type="button" className="eduos-admin-btn-sm" onClick={addComment} disabled={saving}>
                        Send
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </>
  );

  if (embedded) return body;
  return <SuperAdminShell title="Support tickets">{body}</SuperAdminShell>;
}

