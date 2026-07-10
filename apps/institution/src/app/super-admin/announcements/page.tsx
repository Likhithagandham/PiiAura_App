"use client";

import { useEffect, useMemo, useState } from "react";
import { apiSend } from "@/lib/api-client";
import { useApiData } from "@/lib/queries";
import type {
  CreateSuperAdminAnnouncementInput,
  SuperAdminAnnouncementsData,
  SuperAdminAnnouncementTarget,
} from "@eduos/types";
import {
  Button,
  ChartLegend,
  DonutChart,
  EmptyState,
  IconChartBar,
  SkeletonTable,
  StatCard,
  TruncatedText,
  chartColor,
} from "@eduos/ui";
import { SuperAdminShell } from "@/components/super-admin/SuperAdminShell";

type BranchOption = { id: string; name: string };

export default function SuperAdminAnnouncementsPage() {
  // Legacy route: keep working, but prefer the merged Engagement module.
  useEffect(() => {
    window.location.replace("/super-admin/engagement?tab=announcements");
  }, []);
  return <p className="eduos-empty">Redirecting…</p>;
}

export function SuperAdminAnnouncementsView({ embedded = false }: { embedded?: boolean }) {
  const { data, error: queryError, refetch } = useApiData<SuperAdminAnnouncementsData>(
    "/api/super-admin/announcements",
  );
  const [sendError, setSendError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [channels, setChannels] = useState<CreateSuperAdminAnnouncementInput["channels"]>(["in_app"]);
  const [targetType, setTargetType] = useState<SuperAdminAnnouncementTarget["type"]>("all");
  // null = untouched → default to the first branch once data loads (derived, no effect).
  const [pickedBranchIds, setPickedBranchIds] = useState<string[] | null>(null);

  const error = sendError ?? (queryError ? (queryError instanceof Error ? queryError.message : "Failed to load") : null);

  const branches = useMemo<BranchOption[]>(() => data?.branches ?? [], [data]);
  const branchIds = pickedBranchIds ?? (branches[0] ? [branches[0].id] : []);

  function toggleChannel(ch: CreateSuperAdminAnnouncementInput["channels"][number]) {
    setChannels((prev) => (prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]));
  }

  function toggleBranch(id: string) {
    setPickedBranchIds((prev) => {
      const base = prev ?? (branches[0] ? [branches[0].id] : []);
      return base.includes(id) ? base.filter((x) => x !== id) : [...base, id];
    });
  }

  async function send() {
    setSaving(true);
    setSendError(null);
    setMessage(null);
    try {
      const target: SuperAdminAnnouncementTarget =
        targetType === "all" ? { type: "all" } : { type: "branches", branchIds };

      await apiSend<unknown>("/api/super-admin/announcements", "POST", {
        title,
        body,
        channels,
        target,
      } satisfies CreateSuperAdminAnnouncementInput);
      setTitle("");
      setBody("");
      setChannels(["in_app"]);
      setTargetType("all");
      setMessage("Announcement sent.");
      await refetch();
    } catch (e) {
      setSendError(e instanceof Error ? e.message : "Send failed");
    } finally {
      setSaving(false);
    }
  }

  const CHANNEL_DEFS = [
    { key: "in_app", label: "In-app" },
    { key: "sms", label: "SMS" },
    { key: "email", label: "Email" },
  ] as const;
  const channelDist = data
    ? CHANNEL_DEFS.map((c, i) => ({
        label: c.label,
        count: data.announcements.filter((a) => a.channels.includes(c.key)).length,
        color: chartColor(i),
      })).filter((c) => c.count > 0)
    : [];

  const content = (
    <>
      {message ? <p className="eduos-admin-message">{message}</p> : null}
      {error ? <p className="eduos-admin-message eduos-admin-message--error">{error}</p> : null}

      <section className="eduos-panel">
        <h2 className="eduos-section-title">Broadcast</h2>
        <p className="eduos-section-desc">Send announcements to all branches or a selected set.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(14rem, 1fr))", gap: "0.5rem", marginTop: "0.5rem" }}>
          <label style={{ fontSize: "0.8125rem" }}>
            Title
            <input
              className="eduos-input eduos-input--field"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Short subject"
              style={{ display: "block", marginTop: "0.2rem", width: "100%" }}
            />
          </label>
          <label style={{ fontSize: "0.8125rem" }}>
            Target
            <select
              className="eduos-input eduos-input--field"
              value={targetType}
              onChange={(e) => setTargetType(e.target.value as SuperAdminAnnouncementTarget["type"])}
              style={{ display: "block", marginTop: "0.2rem" }}
            >
              <option value="all">All branches</option>
              <option value="branches">Selected branches</option>
            </select>
          </label>
          <div>
            <div style={{ fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.25rem" }}>Channels</div>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              {(["in_app", "sms", "email"] as const).map((ch) => (
                <label key={ch} style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.875rem" }}>
                  <input type="checkbox" checked={channels.includes(ch)} onChange={() => toggleChannel(ch)} />
                  {ch === "in_app" ? "In-app" : ch.toUpperCase()}
                </label>
              ))}
            </div>
          </div>
        </div>

        <label style={{ display: "block", marginTop: "0.5rem", fontSize: "0.8125rem" }}>
          Message
          <textarea
            className="eduos-input eduos-input--field"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            placeholder="Write the announcement…"
            style={{ display: "block", width: "100%", marginTop: "0.2rem" }}
          />
        </label>

        {targetType === "branches" ? (
          <div style={{ marginTop: "0.75rem" }}>
            <div style={{ fontWeight: 700, fontSize: "0.875rem" }}>Select branches</div>
            {!branches.length ? (
              <EmptyState compact title="No branches" description="No branches available to target." />
            ) : (
              <div style={{ marginTop: "0.35rem", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {branches.map((b) => (
                  <label
                    key={b.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      padding: "0.35rem 0.5rem",
                      border: "1px solid var(--eduos-border)",
                      borderRadius: "999px",
                      background: branchIds.includes(b.id) ? "var(--eduos-nav-active-bg)" : "var(--eduos-card)",
                      fontSize: "0.8125rem",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={branchIds.includes(b.id)}
                      onChange={() => toggleBranch(b.id)}
                    />
                    {b.name}
                  </label>
                ))}
              </div>
            )}
          </div>
        ) : null}

        <div className="eduos-portal-toolbar" style={{ marginTop: "0.75rem" }}>
          <Button type="button" className="eduos-admin-btn-sm" onClick={send} disabled={saving}>
            {saving ? "Sending…" : "Send announcement"}
          </Button>
        </div>
      </section>

      {data && data.announcements.length > 0 ? (
        <section className="eduos-panel">
          <h2 className="eduos-section-title">Overview</h2>
          <p className="eduos-section-desc">Announcements sent, by delivery channel.</p>
          <div className="eduos-admin-stat-grid" style={{ marginBottom: "1rem" }}>
            <StatCard
              label="Total sent"
              value={data.announcements.length}
              icon={<IconChartBar />}
              accent="#2563eb"
            />
          </div>
          {channelDist.length > 0 ? (
            <div className="eduos-chart-split">
              <DonutChart
                data={channelDist.map((c) => ({ label: c.label, value: c.count, color: c.color }))}
                centerValue={data.announcements.length}
                centerLabel="Sent"
              />
              <div className="eduos-chart-split__legend">
                <ChartLegend
                  items={channelDist.map((c) => ({ label: c.label, color: c.color, value: c.count }))}
                />
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="eduos-panel">
        <h2 className="eduos-section-title">History</h2>
        {!data ? (
          <SkeletonTable columns={5} rows={5} />
        ) : data.announcements.length === 0 ? (
          <EmptyState title="No announcements yet" description="Broadcast a message to see it here." />
        ) : (
          <div className="eduos-table-wrap">
            <table className="eduos-admin-table">
              <thead>
                <tr>
                  <th className="eduos-admin-table__nowrap">When</th>
                  <th>Title</th>
                  <th className="eduos-admin-table__nowrap">Target</th>
                  <th className="eduos-admin-table__nowrap">Channels</th>
                  <th className="eduos-admin-table__nowrap">By</th>
                </tr>
              </thead>
              <tbody>
                {data.announcements.map((a) => (
                  <tr key={a.id}>
                    <td className="eduos-admin-table__nowrap">{new Date(a.createdAt).toLocaleString()}</td>
                    <td>
                      <div style={{ fontWeight: 700 }}>
                        <TruncatedText text={a.title} maxWidth="16rem" />
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--eduos-text-muted)", marginTop: "0.2rem" }}>
                        {a.body.length > 90 ? `${a.body.slice(0, 90)}…` : a.body}
                      </div>
                    </td>
                    <td className="eduos-admin-table__nowrap">
                      {a.target.type === "all" ? "All" : `${a.target.branchIds.length} branches`}
                    </td>
                    <td className="eduos-admin-table__nowrap">{a.channels.join(", ")}</td>
                    <td className="eduos-admin-table__nowrap">{a.createdBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );

  if (embedded) return content;
  return <SuperAdminShell title="Announcements">{content}</SuperAdminShell>;
}

