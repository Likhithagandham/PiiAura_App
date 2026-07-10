"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { FacultyQuickAction } from "@eduos/types";
import {
  IconCalendar,
  IconCheckCircle,
  IconHourglass,
  StatCard,
  PortalDashboardSkeleton,
  PortalWelcomeStrip,
  Spinner,
} from "@eduos/ui";
import { useAuth } from "@eduos/hooks";
import { useTenantBranding } from "@/components/shared/portal-polish/useTenantBranding";
import { apiGet, apiSend } from "@/lib/api-client";
import {
  FACULTY_LIVE_ATTENDANCE_POLL_MS as POLL_MS,
  useFacultyDashboardQuery,
  useFacultyLiveAttendanceQuery,
} from "@/lib/queries";
import { FacultyShell } from "../FacultyShell";
import { FacultyAnnouncementsPanel } from "./FacultyAnnouncementsPanel";
import { FacultyHolidayPanel } from "./FacultyHolidayPanel";
import { FacultyTodaySchedulePanel } from "./FacultyTodaySchedulePanel";
import { IconAttendanceCheck, IconMegaphone } from "./FacultyDashboardIcons";

interface MyAttendanceSummary {
  month: string;
  presentDays: number;
  workingDays: number;
  markedToday: boolean;
}

function MyAttendanceCard() {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const { data: summary, error: loadError, refetch } = useQuery({
    queryKey: ["faculty", "my-attendance"] as const,
    queryFn: () => apiGet<MyAttendanceSummary>("/api/faculty/my-attendance"),
  });
  const displayErr = err ?? (loadError ? "Could not load attendance" : null);

  async function checkIn() {
    setBusy(true);
    setErr(null);
    try {
      await apiSend<MyAttendanceSummary>("/api/faculty/my-attendance", "POST");
      await refetch();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Check-in failed");
    } finally {
      setBusy(false);
    }
  }

  const markedToday = summary?.markedToday ?? false;

  return (
    <StatCard
      label="My attendance"
      value={summary ? `${summary.presentDays}/${summary.workingDays}` : "—"}
      icon={<IconCheckCircle />}
      accent="#1a5f4a"
      sub={summary ? `Days present · ${summary.month}` : "this month"}
    >
      {markedToday ? (
        <span style={{ marginTop: "0.4rem", display: "block", fontSize: "0.75rem", color: "#16a34a", fontWeight: 600 }}>
          ✓ Present today
        </span>
      ) : (
        <button
          type="button"
          onClick={checkIn}
          disabled={busy}
          style={{
            marginTop: "0.4rem",
            padding: "0.4rem 0.8rem",
            borderRadius: "var(--eduos-radius)",
            border: "1px solid var(--eduos-primary)",
            background: "var(--eduos-primary)",
            color: "#fff",
            fontSize: "0.8125rem",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {busy ? "Marking…" : "Mark my attendance"}
        </button>
      )}
      {displayErr ? (
        <span style={{ marginTop: "0.3rem", display: "block", fontSize: "0.7rem", color: "var(--eduos-danger)" }}>
          {displayErr}
        </span>
      ) : null}
    </StatCard>
  );
}

function alertCountClass(severity: "info" | "warning" | "critical"): string {
  if (severity === "critical") return "eduos-priority-alert__count eduos-priority-alert__count--critical";
  if (severity === "warning") return "eduos-priority-alert__count eduos-priority-alert__count--warning";
  return "eduos-priority-alert__count eduos-priority-alert__count--info";
}

function alertRowClass(severity: "info" | "warning" | "critical"): string {
  const base = "eduos-priority-alert";
  return severity === "warning" ? `${base} eduos-priority-alert--warning` : base;
}

function renderQuickAction(action: FacultyQuickAction) {
  const isPrimary = action.variant === "primary";
  const className = `eduos-quick-action ${isPrimary ? "eduos-quick-action--primary" : "eduos-quick-action--secondary"}`;
  return (
    <Link key={action.id} href={action.href} className={className} style={{ textDecoration: "none" }}>
      <div className="eduos-quick-action__icon" aria-hidden>
        {isPrimary ? <IconAttendanceCheck color="#fff" /> : <IconMegaphone color="var(--eduos-brand)" />}
      </div>
      <div>
        <div className="eduos-quick-action__title">{action.label}</div>
        <div className="eduos-quick-action__desc">{action.description}</div>
      </div>
    </Link>
  );
}

export function FacultyDashboardView() {
  const { user } = useAuth();
  const branding = useTenantBranding();

  const { data, error: dashError } = useFacultyDashboardQuery();
  const { data: live = null } = useFacultyLiveAttendanceQuery();
  const error = dashError ? "Could not load dashboard data." : null;

  const sessionsToday = data?.snapshot.sessionsToday ?? 0;

  return (
    <FacultyShell title="Dashboard">
      {error ? <p className="eduos-admin-message eduos-admin-message--error">{error}</p> : null}
      {!data ? (
        <PortalDashboardSkeleton statCount={3} />
      ) : (
        <div className="portal-dashboard-stack">
          <PortalWelcomeStrip
            eyebrow="Teaching day"
            title={user?.name ? `Hello, ${user.name.split(" ")[0]}` : "Hello"}
            description={
              branding?.institutionName
                ? `${sessionsToday} session${sessionsToday === 1 ? "" : "s"} today at ${branding.institutionName}.`
                : `${sessionsToday} session${sessionsToday === 1 ? "" : "s"} scheduled for today.`
            }
            badge={data.snapshot.pendingLeave > 0 ? `${data.snapshot.pendingLeave} leave pending` : "All clear"}
          />
          <div className="eduos-admin-stat-grid">
            <MyAttendanceCard />

            <StatCard
              label="Pending leave"
              value={data.snapshot.pendingLeave}
              icon={<IconHourglass />}
              accent="#d69e2e"
              sub={data.snapshot.pendingLeave > 0 ? undefined : "No pending requests"}
              trend={
                data.snapshot.pendingLeave > 0
                  ? { label: "Awaiting your review", direction: "up" }
                  : undefined
              }
            />

            <StatCard
              label="Sessions today"
              value={sessionsToday}
              icon={<IconCalendar />}
              accent="#2563eb"
              sub="Classes scheduled today"
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", maxWidth: "640px" }}>
            {data.quickActions.map(renderQuickAction)}
          </div>

          <div className="eduos-dashboard-grid">
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <section className="eduos-panel">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1.25rem",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                  }}
                >
                  <h2 className="eduos-section-title">Live attendance</h2>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontSize: "0.75rem",
                      color: "var(--eduos-text-muted)",
                    }}
                  >
                    <span className="eduos-live-dot" />
                    My classes · Updates every {POLL_MS / 1000}s
                  </div>
                </div>

                {!live ? (
                  <div className="portal-live-loading">
                    <Spinner size="sm" label="Connecting to live attendance feed" />
                  </div>
                ) : live.classes.length === 0 ? (
                  <p className="eduos-empty eduos-empty--sm">
                    You are not the class teacher of any class.
                  </p>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                      gap: "0.75rem",
                    }}
                  >
                    {live.classes.map((c) => {
                      const pct = c.total > 0 ? Math.round((c.present / c.total) * 100) : 0;
                      const color = pct >= 75 ? "#1a5f4a" : pct >= 50 ? "#d69e2e" : "var(--eduos-danger)";
                      return (
                        <div
                          key={c.classId}
                          style={{
                            border: "1px solid var(--eduos-border)",
                            borderRadius: "var(--eduos-radius)",
                            padding: "0.75rem",
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.25rem",
                          }}
                        >
                          <div style={{ fontWeight: 700, fontSize: "0.8125rem" }}>{c.classLabel}</div>
                          <div style={{ fontSize: "1.5rem", fontWeight: 800, color }}>{pct}%</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--eduos-text-muted)" }}>
                            {c.present}/{c.total} present
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              <FacultyHolidayPanel holidays={data.upcomingHolidays} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <section className="eduos-panel">
                <div
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}
                >
                  <h2 className="eduos-priority-panel__title">Priority alerts</h2>
                  {data.alerts.some((a) => a.severity === "critical") ? (
                    <span className="eduos-priority-panel__badge">Action needed</span>
                  ) : null}
                </div>
                {data.alerts.length === 0 ? (
                  <p className="eduos-empty eduos-empty--sm">No priority items right now.</p>
                ) : (
                  data.alerts.map((alert) => (
                    <Link
                      key={alert.id}
                      href={alert.href ?? "#"}
                      className={alertRowClass(alert.severity)}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <div>
                        <div className="eduos-priority-alert__title">{alert.title}</div>
                        <div className="eduos-priority-alert__msg">{alert.message}</div>
                      </div>
                      {alert.count != null ? (
                        <span className={alertCountClass(alert.severity)}>{alert.count}</span>
                      ) : null}
                    </Link>
                  ))
                )}
              </section>

              <FacultyAnnouncementsPanel announcements={data.announcements} />

              <FacultyTodaySchedulePanel schedule={data.schedule} today={data.today} />
            </div>
          </div>
        </div>
      )}
    </FacultyShell>
  );
}
