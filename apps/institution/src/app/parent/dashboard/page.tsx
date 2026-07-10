"use client";

import { useCallback, useEffect, useState } from "react";
import type { ParentDashboardData } from "@eduos/types";
import { PortalDashboardSkeleton, PortalWelcomeStrip } from "@eduos/ui";
import { parentApiUrl, useParentChild } from "@/lib/parent/parent-child-context";

const ATTENDANCE_LABEL: Record<ParentDashboardData["attendanceToday"]["status"], string> = {
  present: "✓ Present today",
  absent: "✗ Absent today",
  late: "✓ Present today",
  excused: "Excused today",
  unmarked: "Not marked yet",
};

function AssignmentsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="M9 12h6M9 16h4" />
    </svg>
  );
}

function MegaphoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M4 10v4a2 2 0 0 0 2 2h1l5 4V6L7 10H6a2 2 0 0 0-2 2Z" />
      <path d="M16 8.5a4.5 4.5 0 0 1 0 7M18.5 6a7.5 7.5 0 0 1 0 12" />
    </svg>
  );
}

export default function ParentDashboardPage() {
  const { childId, activeChild } = useParentChild();
  const [data, setData] = useState<ParentDashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!childId) return;
    setError(null);
    const res = await fetch(parentApiUrl("/api/parent/dashboard", childId), {
      credentials: "include",
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError((json as { error?: string }).error ?? "Failed to load");
      return;
    }
    const payload = json as ParentDashboardData;
    setData({
      ...payload,
      todayAssignments: payload.todayAssignments ?? [],
      announcements: payload.announcements ?? [],
    });
  }, [childId]);

  useEffect(() => {
    load();
  }, [load]);

  const pendingCount =
    data?.todayAssignments.filter((a) => a.status !== "submitted").length ?? 0;

  return (
    <>
      {error ? <p className="eduos-admin-message eduos-admin-message--error">{error}</p> : null}
      {!childId || !data ? (
        <PortalDashboardSkeleton statCount={4} />
      ) : (
        <div className="portal-dashboard-stack" data-tour="dashboard-main">
          <PortalWelcomeStrip
            eyebrow="Family overview"
            title={activeChild?.name ?? "Your child"}
            description={
              data.linkedChildrenCount > 1
                ? `Viewing ${activeChild?.name} · ${data.linkedChildrenCount} children linked to your account.`
                : "Attendance, fees, assignments, and school notices for today."
            }
            badge={data.attendanceToday.status === "present" ? "Present today" : ATTENDANCE_LABEL[data.attendanceToday.status]}
          />

          <div className="eduos-admin-stat-grid" style={{ marginTop: "0.5rem" }} data-tour="dashboard-kpis">
            <article className="eduos-kpi eduos-kpi--compact eduos-kpi--brand">
              <div className="eduos-kpi__label">Today</div>
              <div className="eduos-kpi__value eduos-kpi__value--md">
                {ATTENDANCE_LABEL[data.attendanceToday.status]}
              </div>
              {data.attendanceToday.subjectName ? (
                <div className="eduos-kpi__sub">{data.attendanceToday.subjectName}</div>
              ) : null}
            </article>
            <article className="eduos-kpi eduos-kpi--compact eduos-kpi--brand">
              <div className="eduos-kpi__label">Attendance</div>
              <div className="eduos-kpi__value eduos-kpi__value--md">{data.attendancePercent}%</div>
            </article>
            <article className="eduos-kpi eduos-kpi--compact eduos-kpi--brand">
              <div className="eduos-kpi__label">Fee due</div>
              <div className="eduos-kpi__value eduos-kpi__value--md">
                {data.feeAlert ? `₹${data.feeAlert.amountDue}` : "Clear"}
              </div>
            </article>
            <article className="eduos-kpi eduos-kpi--compact eduos-kpi--brand">
              <div className="eduos-kpi__label">Exams</div>
              <div className="eduos-kpi__value eduos-kpi__value--md">{data.upcomingExamsCount}</div>
              <div className="eduos-kpi__sub">{data.nextExamLabel ?? "None scheduled"}</div>
            </article>
          </div>

          {data.attendanceToday.status === "absent" ? (
            <section className="eduos-panel" style={{ borderColor: "var(--eduos-danger)" }}>
              <h2 className="eduos-section-title">Absence alert</h2>
              <p className="eduos-section-desc">
                Your child was marked absent today. SMS alerts are sent when enabled under Account →
                Alerts.
              </p>
            </section>
          ) : null}

          <div className="eduos-parent-dash-panels">
            <div className="eduos-split-panels">
              <section className="eduos-parent-dash-panel">
                <div className="eduos-parent-dash-panel__accent" />
                <div className="eduos-parent-dash-panel__body">
                  <div className="eduos-parent-dash-panel__header">
                    <span className="eduos-parent-dash-panel__icon" aria-hidden="true">
                      <AssignmentsIcon />
                    </span>
                    <h2 className="eduos-parent-dash-panel__title">Today&apos;s assignments</h2>
                    {data.todayAssignments.length > 0 ? (
                      <span className="eduos-parent-dash-panel__count">
                        {pendingCount > 0 ? `${pendingCount} pending` : "All done"}
                      </span>
                    ) : null}
                  </div>

                  {data.todayAssignments.length === 0 ? (
                    <div className="eduos-parent-dash-empty">
                      <span className="eduos-parent-dash-empty__icon" aria-hidden="true">
                        <AssignmentsIcon />
                      </span>
                      <p className="eduos-parent-dash-empty__title">Nothing due today</p>
                      <p className="eduos-parent-dash-empty__desc">
                        Assignments due today will appear here.
                      </p>
                    </div>
                  ) : (
                    <ul className="eduos-parent-dash-list">
                      {data.todayAssignments.map((a) => {
                        const submitted = a.status === "submitted";
                        return (
                          <li key={a.id} className="eduos-parent-dash-item">
                            <span className="eduos-parent-dash-item__dot" aria-hidden="true" />
                            <div className="eduos-parent-dash-item__main">
                              <div className="eduos-parent-dash-item__title">{a.title}</div>
                              <div className="eduos-parent-dash-item__meta">{a.subjectName}</div>
                            </div>
                            <span
                              className={`eduos-parent-dash-badge ${
                                submitted
                                  ? "eduos-parent-dash-badge--done"
                                  : "eduos-parent-dash-badge--pending"
                              }`}
                            >
                              {submitted ? "Submitted" : "Pending"}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </section>

              <div className="eduos-split-panels__rule eduos-split-panels__rule--brand" aria-hidden="true" />

              <section className="eduos-parent-dash-panel">
                <div className="eduos-parent-dash-panel__accent" />
                <div className="eduos-parent-dash-panel__body">
                  <div className="eduos-parent-dash-panel__header">
                    <span className="eduos-parent-dash-panel__icon" aria-hidden="true">
                      <MegaphoneIcon />
                    </span>
                    <h2 className="eduos-parent-dash-panel__title">Announcements</h2>
                    {data.announcements.length > 0 ? (
                      <span className="eduos-parent-dash-panel__count">
                        {data.announcements.length} new
                      </span>
                    ) : null}
                  </div>

                  {data.announcements.length === 0 ? (
                    <div className="eduos-parent-dash-empty">
                      <span className="eduos-parent-dash-empty__icon" aria-hidden="true">
                        <MegaphoneIcon />
                      </span>
                      <p className="eduos-parent-dash-empty__title">No notices</p>
                      <p className="eduos-parent-dash-empty__desc">
                        School announcements will appear here.
                      </p>
                    </div>
                  ) : (
                    <ul className="eduos-parent-dash-list">
                      {data.announcements.map((a) => (
                        <li key={a.id} className="eduos-parent-dash-item">
                          <span className="eduos-parent-dash-item__dot" aria-hidden="true" />
                          <div className="eduos-parent-dash-item__main">
                            <div className="eduos-parent-dash-item__title">{a.title}</div>
                            <div className="eduos-parent-dash-item__meta">
                              {a.body.slice(0, 120)}
                              {a.body.length > 120 ? "…" : ""}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
