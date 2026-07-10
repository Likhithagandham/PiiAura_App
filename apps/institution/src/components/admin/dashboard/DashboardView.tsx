"use client";

import Link from "next/link";
import { useState } from "react";
import type { AdminQuickAction, AdminQuickActionType } from "@eduos/types";
import { useAuth } from "@eduos/hooks";
import { PortalDashboardSkeleton, PortalWelcomeStrip, Spinner } from "@eduos/ui";
import { useTenantBranding } from "@/components/shared/portal-polish/useTenantBranding";
import {
  LIVE_ATTENDANCE_POLL_MS as POLL_MS,
  useAdminDashboardQuery,
  useAdminLiveAttendanceQuery,
} from "@/lib/queries";
import { AdminShell } from "../AdminShell";
import { HolidayCalendarPanel } from "./HolidayCalendarPanel";
import { MarkHolidayModal } from "./MarkHolidayModal";
import { RecentAnnouncementsPanel } from "./RecentAnnouncementsPanel";
import { SendAnnouncementModal } from "./SendAnnouncementModal";
import { IconCalendarHoliday, IconMegaphone, IconTrendUp } from "./DashboardIcons";

function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function AttendanceRing({ percent }: { percent: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  return (
    <div className="eduos-ring" aria-label={`${percent}% global attendance`}>
      <svg width="144" height="144" viewBox="0 0 120 120" aria-hidden>
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--eduos-accent-blue)" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="var(--eduos-primary)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform="rotate(-90 60 60)"
        />
      </svg>
      <div className="eduos-ring__label">
        {percent}%
        <small>GLOBAL</small>
      </div>
    </div>
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

export function DashboardView() {
  const { user } = useAuth();
  const branding = useTenantBranding();
  const [modal, setModal] = useState<AdminQuickActionType | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const { data, error: dashError, isFetching, isPending } = useAdminDashboardQuery();
  const { data: livePolled } = useAdminLiveAttendanceQuery();
  // Prefer the freshly polled snapshot; fall back to the one embedded in the
  // dashboard payload so the panel renders immediately on first load.
  const live = livePolled ?? data?.live ?? null;
  const error =
    dashError && !isFetching && !isPending ? "Could not load dashboard data." : null;

  function renderQuickAction(action: AdminQuickAction) {
    const isHoliday = action.id === "mark-holiday";
    const className = `eduos-quick-action ${isHoliday ? "eduos-quick-action--primary" : "eduos-quick-action--secondary"}`;
    const inner = (
      <>
        <div className="eduos-quick-action__icon" aria-hidden>
          {isHoliday ? <IconCalendarHoliday color="#fff" /> : <IconMegaphone color="var(--eduos-brand)" />}
        </div>
        <div>
          <div className="eduos-quick-action__title">{action.label}</div>
          <div className="eduos-quick-action__desc">{action.description}</div>
        </div>
      </>
    );

    if (action.action) {
      return (
        <button key={action.id} type="button" className={className} onClick={() => setModal(action.action!)}>
          {inner}
        </button>
      );
    }
    return (
      <Link key={action.id} href={action.href ?? "#"} className={className} style={{ textDecoration: "none" }}>
        {inner}
      </Link>
    );
  }

  const presentPct = data?.snapshot?.studentsPresentPercent ?? 0;

  return (
    <AdminShell title="Dashboard">
      {error ? <p className="eduos-admin-message eduos-admin-message--error">{error}</p> : null}
      {!data ? (
        <PortalDashboardSkeleton statCount={2} />
      ) : (
        <div className="portal-dashboard-stack" data-tour="dashboard-main">
          <PortalWelcomeStrip
            eyebrow="Branch overview"
            title={user?.name ? `Welcome back, ${user.name.split(" ")[0]}` : "Welcome back"}
            description={
              branding?.institutionName
                ? `Today at ${branding.institutionName} — attendance, fees, and priority items in one place.`
                : "Attendance, fees, and priority items for your branch in one place."
            }
            badge={`${data.snapshot.studentsPresentPercent}% present`}
          />
          <div className="eduos-dashboard-kpis" data-tour="dashboard-kpis">
            <article className="eduos-kpi">
              <div className="eduos-kpi__label">Students present</div>
              <div className="eduos-kpi__value">{data.snapshot.studentsPresentPercent}%</div>
              <div className="eduos-kpi__sub">
                {data.snapshot.studentsPresentCount} / {data.snapshot.studentsTotal} students
              </div>
              <div className="eduos-kpi__bar">
                <div className="eduos-kpi__bar-fill" style={{ width: `${presentPct}%` }} />
              </div>
            </article>

            <article className="eduos-kpi">
              <div className="eduos-kpi__label">Fee collected today</div>
              <div className="eduos-kpi__value">{formatInr(data.snapshot.feeCollectedToday)}</div>
              {data.snapshot.feeTrendLabel ? (
                <div className="eduos-kpi__trend">
                  <IconTrendUp color="var(--eduos-trend)" />
                  {data.snapshot.feeTrendLabel}
                </div>
              ) : null}
            </article>
          </div>

          {/* Quick actions */}
          <div
            data-tour="quick-actions"
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", maxWidth: "640px" }}
          >
            {data.quickActions.map(renderQuickAction)}
          </div>

          {/* Main grid: left content + right rail */}
          <div className="eduos-dashboard-grid">
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Live attendance */}
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
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", color: "var(--eduos-text-muted)" }}>
                    <span className="eduos-live-dot" />
                    Real-time status · Updates every {POLL_MS / 1000}s
                  </div>
                </div>

                {live ? (
                  <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
                    <AttendanceRing percent={live.percent} />
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "0.75rem",
                        flex: 1,
                        minWidth: "200px",
                      }}
                    >
                      {live.classes.slice(0, 5).map((c) => {
                        const pct = c.total > 0 ? Math.round((c.present / c.total) * 100) : 0;
                        return (
                          <div key={c.classId} className="eduos-class-chip">
                            <div className="eduos-class-chip__name">{c.classLabel}</div>
                            <div className="eduos-class-chip__meta">
                              {c.present}/{c.total}
                            </div>
                            <div className="eduos-class-chip__pct">{pct}%</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="portal-live-loading">
                    <Spinner size="sm" label="Connecting to live attendance feed" />
                  </div>
                )}
              </section>

              <HolidayCalendarPanel refreshKey={refreshKey} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Priority alerts */}
              <section className="eduos-panel">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                  <h2 className="eduos-priority-panel__title">Priority alerts</h2>
                  <span className="eduos-priority-panel__badge">Action needed</span>
                </div>
                {data.alerts.map((alert) => (
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
                ))}
              </section>

              <RecentAnnouncementsPanel refreshKey={refreshKey} onNewAnnouncement={() => setModal("send-announcement")} />
            </div>
          </div>
        </div>
      )}

      {modal === "mark-holiday" ? <MarkHolidayModal onClose={() => setModal(null)} onSaved={() => setRefreshKey((k) => k + 1)} /> : null}
      {modal === "send-announcement" ? (
        <SendAnnouncementModal onClose={() => setModal(null)} onSent={() => setRefreshKey((k) => k + 1)} />
      ) : null}
    </AdminShell>
  );
}
