"use client";

import {
  EmptyState,
  IconAlertTriangle,
  IconCalendar,
  IconCheckCircle,
  ProgressRing,
  StatCard,
  TruncatedText,
  PortalDashboardSkeleton,
  PortalWelcomeStrip,
} from "@eduos/ui";
import { ExportCsvButton } from "@/components/shared/ExportCsvButton";
import { StudentShell } from "@/components/student/StudentShell";
import { useStudentDashboardQuery } from "@/lib/queries";

export default function StudentDashboardPage() {
  const { data, error: queryError } = useStudentDashboardQuery();
  const error = queryError ? (queryError instanceof Error ? queryError.message : "Failed to load") : null;

  return (
    <StudentShell title="Dashboard">
      {error ? <p className="eduos-admin-message eduos-admin-message--error">{error}</p> : null}
      {!data ? (
        <PortalDashboardSkeleton statCount={2} />
      ) : (
        <div className="portal-dashboard-stack" data-tour="dashboard-main">
          <PortalWelcomeStrip
            eyebrow="Your day"
            title={`Welcome, ${data.profile.name.split(" ")[0]}`}
            description={`${data.profile.classLabel} — attendance, schedule, and announcements at a glance.`}
            badge={`${data.attendancePercent}% attendance`}
          />

          {data.attendanceAlert ? (
            <section
              className="eduos-panel"
              style={{
                marginTop: "0.5rem",
                borderColor:
                  data.attendanceAlert.level === "critical" ? "var(--eduos-danger)" : "var(--eduos-warning, #d69e2e)",
              }}
            >
              <h2 className="eduos-section-title">
                Attendance {data.attendanceAlert.level === "critical" ? "alert" : "warning"}
              </h2>
              <p className="eduos-section-desc" style={{ margin: 0 }}>
                {data.attendanceAlert.message}
              </p>
            </section>
          ) : null}

          <section className="eduos-panel" style={{ marginTop: "0.5rem" }}>
            <div className="eduos-chart-split">
              <ProgressRing
                percent={data.attendancePercent}
                color={data.attendancePercent < data.attendanceThreshold ? "#dc2626" : "#1a5f4a"}
                caption="Attendance"
              />
              <div className="eduos-chart-split__legend">
                <h2 className="eduos-section-title" style={{ marginTop: 0 }}>
                  Attendance
                </h2>
                <p className="eduos-section-desc" style={{ margin: 0 }}>
                  Minimum {data.attendanceThreshold}% required to stay exam-eligible.
                </p>
                <div style={{ marginTop: "0.5rem" }}>
                  <ExportCsvButton endpoint="/api/student/exports/attendance" label="Download my attendance CSV" />
                </div>
              </div>
            </div>
          </section>

          <div className="eduos-admin-stat-grid" data-tour="dashboard-kpis">
            <StatCard
              label="Upcoming exams"
              value={data.upcomingExamsCount}
              icon={<IconCalendar />}
              accent="#2563eb"
              sub={data.nextExamLabel ?? "None scheduled"}
            />
            {data.institutionType === "college" ? (
              <StatCard
                label="Hall ticket"
                value={data.hallTicketAvailable ? "Ready" : "Fee due"}
                icon={data.hallTicketAvailable ? <IconCheckCircle /> : <IconAlertTriangle />}
                accent={data.hallTicketAvailable ? "#1a5f4a" : "#dc2626"}
              />
            ) : null}
          </div>

          {data.feeAlert ? (
            <section className="eduos-panel" style={{ borderColor: "var(--eduos-danger)" }}>
              <h2 className="eduos-section-title">Fee alert</h2>
              <p className="eduos-section-desc">{data.feeAlert.message}</p>
            </section>
          ) : null}

          <section className="eduos-panel">
            <h2 className="eduos-section-title">Today&apos;s schedule</h2>
            {data.scheduleToday.length === 0 ? (
              <EmptyState compact title="No classes today" description="You have no classes scheduled today." />
            ) : (
              <div className="eduos-table-wrap">
                <table className="eduos-admin-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Subject</th>
                      <th>Room</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.scheduleToday.map((s, i) => (
                      <tr key={i}>
                        <td className="eduos-admin-table__nowrap">
                          {s.startTime}–{s.endTime}
                        </td>
                        <td>
                          <TruncatedText text={s.subjectName} maxWidth="16rem" />
                        </td>
                        <td>
                          <TruncatedText text={s.roomName} maxWidth="16rem" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="eduos-panel">
            <h2 className="eduos-section-title">Announcements</h2>
            {data.announcements.length === 0 ? (
              <EmptyState compact title="No announcements" description="New notices will show up here." />
            ) : (
              <ul style={{ margin: "0.5rem 0 0", paddingLeft: "1.1rem", fontSize: "0.8125rem" }}>
                {data.announcements.map((a) => (
                  <li key={a.id} style={{ marginBottom: "0.35rem" }}>
                    <strong>{a.title}</strong> — {a.body.slice(0, 80)}
                    {a.body.length > 80 ? "…" : ""}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </StudentShell>
  );
}
