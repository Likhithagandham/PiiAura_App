"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type {
  AttendanceAuditEntry,
  AttendanceData,
  AttendanceRecord,
  AttendanceReportQuery,
  AttendanceStatus,
  ClassBatchSection,
  LeaveRequest,
  LiveAttendanceSnapshot,
} from "@eduos/types";
import { Button, Input, ListSearchBar, filterBySearch } from "@eduos/ui";
import { LeaveRequestStatusTag } from "@/components/shared/LeaveRequestStatusTag";
import { useApiData } from "@/lib/queries";
import { AdminShell } from "../AdminShell";
import { AdminModal } from "../AdminModal";
import { AdminMessage, AdminTabs } from "../ui";
import { AdminMarkAttendancePanel } from "./AdminMarkAttendancePanel";
import { useClassSectionFilters } from "./useClassSectionFilters";

const POLL_MS = 15_000;





const tabs = ["Live", "Mark", "Leave", "Reports", "Audit", "Rules"] as const;
type Tab = (typeof tabs)[number];

function currentIsoWeek(): string {
  const date = new Date();
  const thursday = new Date(date);
  thursday.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const year = thursday.getFullYear();
  const jan4 = new Date(year, 0, 4);
  const week =
    1 +
    Math.round(
      ((thursday.getTime() - jan4.getTime()) / 86400000 -
        3 +
        ((jan4.getDay() + 6) % 7)) /
        7,
    );
  return `${year}-W${String(week).padStart(2, "0")}`;
}

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

function reportQueryString(query: AttendanceReportQuery): string {
  const params = new URLSearchParams();
  if (query.period) params.set("period", query.period);
  if (query.week) params.set("week", query.week);
  if (query.month) params.set("month", query.month);
  if (query.batchId) params.set("batchId", query.batchId);
  return params.toString();
}

function formatReportRange(filters: AttendanceData["reportFilters"]): string {
  if (!filters) return "";
  if (filters.period === "weekly") {
    return `${filters.dateFrom} – ${filters.dateTo}${filters.week ? ` (${filters.week})` : ""}`;
  }
  return `${filters.dateFrom} – ${filters.dateTo}${filters.month ? ` (${filters.month})` : ""}`;
}

function LeaveTab({
  data,
  studentSearch,
  onStudentSearchChange,
  onReview,
}: {
  data: AttendanceData;
  studentSearch: string;
  onStudentSearchChange: (v: string) => void;
  onReview: (req: LeaveRequest) => void;
}) {
  const classSections = data.classSections ?? [];
  const {
    gradeKey,
    setGradeKey,
    sectionId,
    setSectionId,
    gradeOptions,
    sectionsForGrade,
  } = useClassSectionFilters(classSections);

  const sectionLeaveRequests = useMemo(() => {
    const leaves = data.leaveRequests;
    if (!sectionId) return leaves;
    return leaves.filter((r) => r.classSectionId === sectionId);
  }, [data.leaveRequests, sectionId]);

  const filteredLeaveRequests = useMemo(
    () =>
      filterBySearch(sectionLeaveRequests, studentSearch, (req) => [
        req.studentName,
        req.classLabel,
        req.appliedByName,
        req.reason,
      ]),
    [sectionLeaveRequests, studentSearch],
  );

  return (
    <section className="eduos-panel">
      <h2 style={{ fontSize: "1rem", fontWeight: 600, margin: "0 0 1rem" }}>Student leave</h2>
      <p style={{ fontSize: "0.8125rem", color: "var(--eduos-text-muted)", marginBottom: "1rem" }}>
        Leave applied by students or parents. Review and approve here. For faculty and staff leave,
        use HR → Leave.
      </p>
      {classSections.length > 0 ? (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.75rem",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem" }}>
            <span style={{ fontWeight: 600, color: "var(--eduos-text-muted)" }}>Grade</span>
            <select
              value={gradeKey}
              onChange={(e) => setGradeKey(e.target.value)}
              className="eduos-input"
              style={{ minWidth: "8rem" }}
            >
              {gradeOptions.map((g) => (
                <option key={g.key} value={g.key}>
                  {g.label}
                </option>
              ))}
            </select>
          </label>
          {sectionsForGrade.length > 0 ? (
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem" }}>
              <span style={{ fontWeight: 600, color: "var(--eduos-text-muted)" }}>Section</span>
              <select
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                className="eduos-input"
                style={{ minWidth: "5rem" }}
              >
                {sectionsForGrade.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.section ?? c.label.split(" - ").pop() ?? c.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>
      ) : null}
      <ListSearchBar
        value={studentSearch}
        onChange={onStudentSearchChange}
        placeholder="Search student or reason…"
        total={sectionLeaveRequests.length}
        filtered={filteredLeaveRequests.length}
      />
      <table className="eduos-admin-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Class</th>
            <th>Dates</th>
            <th>Reason</th>
            <th>Applied by</th>
            <th>Status</th>
            <th>Reviewed by</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {filteredLeaveRequests.length === 0 ? (
            <tr>
              <td colSpan={8} style={{ color: "var(--eduos-text-muted)", fontSize: "0.8125rem" }}>
                No leave requests for this section.
              </td>
            </tr>
          ) : (
            filteredLeaveRequests.map((req) => (
              <tr key={req.id}>
                <td>{req.studentName}</td>
                <td>{req.classLabel}</td>
                <td>
                  {req.fromDate === req.toDate ? req.fromDate : `${req.fromDate} – ${req.toDate}`}
                </td>
                <td>{req.reason}</td>
                <td>
                  {req.appliedByName} ({req.appliedByRole})
                </td>
                <td>
                  <LeaveRequestStatusTag status={req.status} />
                </td>
                <td style={{ fontSize: "0.8125rem", color: "var(--eduos-text-muted)" }}>
                  {req.reviewedByName ?? "—"}
                </td>
                <td>
                  {req.status === "pending" ? (
                    <Button type="button" onClick={() => onReview(req)}>
                      Review
                    </Button>
                  ) : (
                    <span style={{ fontSize: "0.75rem", color: "var(--eduos-text-muted)" }}>
                      {req.reviewNote ?? "—"}
                    </span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </section>
  );
}

function ReportsTab({
  data,
  studentSearch,
  onStudentSearchChange,
  onRefresh,
  onExportDetention,
  onExportPeriod,
}: {
  data: AttendanceData;
  studentSearch: string;
  onStudentSearchChange: (v: string) => void;
  onRefresh: (query: AttendanceReportQuery) => void;
  onExportDetention: (query: AttendanceReportQuery) => void;
  onExportPeriod: (query: AttendanceReportQuery) => void;
}) {
  const classSections = data.classSections ?? [];
  const {
    gradeKey,
    setGradeKey,
    sectionId,
    setSectionId,
    gradeOptions,
    sectionsForGrade,
  } = useClassSectionFilters(classSections);
  const [period, setPeriod] = useState<"weekly" | "monthly">(
    data.reportFilters?.period ?? "monthly",
  );
  const [week, setWeek] = useState(data.reportFilters?.week ?? currentIsoWeek());
  const [month, setMonth] = useState(data.reportFilters?.month ?? currentMonth());

  const reportQuery = useMemo((): AttendanceReportQuery | null => {
    if (classSections.length > 0 && !sectionId) return null;
    return {
      period,
      ...(period === "weekly" ? { week } : { month }),
      ...(sectionId ? { batchId: sectionId } : {}),
    };
  }, [classSections.length, sectionId, period, week, month]);

  useEffect(() => {
    if (!reportQuery) return;
    onRefresh(reportQuery);
  }, [reportQuery, onRefresh]);

  const studentRowFields = (row: { studentName: string; classLabel?: string; studentId?: string }) => [
    row.studentName,
    row.classLabel,
    row.studentId,
  ];

  const filteredDetentionList = useMemo(
    () => filterBySearch(data.detentionList, studentSearch, studentRowFields),
    [data.detentionList, studentSearch],
  );

  const filteredShortageReport = useMemo(
    () => filterBySearch(data.shortageReport, studentSearch, studentRowFields),
    [data.shortageReport, studentSearch],
  );

  const filteredPeriodReports = useMemo(
    () => filterBySearch(data.periodReports, studentSearch, studentRowFields),
    [data.periodReports, studentSearch],
  );

  const rangeLabel = formatReportRange(data.reportFilters);
  const periodColumnLabel = period === "weekly" ? "Week" : "Month";

  const periodScrollRef = useRef<HTMLDivElement>(null);
  const periodVirtualizer = useVirtualizer({
    count: filteredPeriodReports.length,
    getScrollElement: () => periodScrollRef.current,
    estimateSize: () => 40,
    overscan: 8,
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div
        className="eduos-panel"
        style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}
      >
        <p style={{ fontSize: "0.8125rem", color: "var(--eduos-text-muted)", margin: 0 }}>
          Filter reports by class and time period. Detention and shortage use the selected period;
          exam days are {data.rules.examDayCountsTowardThreshold ? "included" : "excluded"} per Rules.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
          {classSections.length > 0 ? (
            <>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem" }}>
                <span style={{ fontWeight: 600, color: "var(--eduos-text-muted)" }}>Grade</span>
                <select
                  value={gradeKey}
                  onChange={(e) => setGradeKey(e.target.value)}
                  className="eduos-input"
                  style={{ minWidth: "8rem" }}
                >
                  {gradeOptions.map((g) => (
                    <option key={g.key} value={g.key}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </label>
              {sectionsForGrade.length > 0 ? (
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem" }}>
                  <span style={{ fontWeight: 600, color: "var(--eduos-text-muted)" }}>Section</span>
                  <select
                    value={sectionId}
                    onChange={(e) => setSectionId(e.target.value)}
                    className="eduos-input"
                    style={{ minWidth: "5rem" }}
                  >
                    {sectionsForGrade.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.section ?? c.label.split(" - ").pop() ?? c.label}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
            </>
          ) : null}
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem" }}>
            <span style={{ fontWeight: 600, color: "var(--eduos-text-muted)" }}>Period</span>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as "weekly" | "monthly")}
              className="eduos-input"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </label>
          {period === "weekly" ? (
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem" }}>
              <span style={{ fontWeight: 600, color: "var(--eduos-text-muted)" }}>Week</span>
              <input
                type="week"
                value={week}
                onChange={(e) => setWeek(e.target.value)}
                className="eduos-input"
              />
            </label>
          ) : (
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem" }}>
              <span style={{ fontWeight: 600, color: "var(--eduos-text-muted)" }}>Month</span>
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="eduos-input"
              />
            </label>
          )}
        </div>
        {rangeLabel ? (
          <p style={{ fontSize: "0.75rem", color: "var(--eduos-text-muted)", margin: 0 }}>
            Showing {rangeLabel}
          </p>
        ) : null}
      </div>

      <ListSearchBar
        value={studentSearch}
        onChange={onStudentSearchChange}
        placeholder="Search student or class…"
        total={data.detentionList.length + data.shortageReport.length}
        filtered={filteredDetentionList.length + filteredShortageReport.length}
      />

      <section className="eduos-panel">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          <div>
            <h2 className="eduos-section-title">Detention list</h2>
            <p style={{ fontSize: "0.8125rem", color: "var(--eduos-text-muted)", margin: "0.25rem 0 0" }}>
              Students below {data.rules.thresholdPercent}% for the selected period (
              {data.detentionList.length} students)
            </p>
          </div>
          <Button
            type="button"
            disabled={!reportQuery}
            onClick={() => reportQuery && onExportDetention(reportQuery)}
          >
            Export CSV
          </Button>
        </div>
        <table className="eduos-admin-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Class</th>
              <th>Present</th>
              <th>Total</th>
              <th>%</th>
            </tr>
          </thead>
          <tbody>
            {filteredDetentionList.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ color: "var(--eduos-text-muted)" }}>
                  No students below threshold for this period.
                </td>
              </tr>
            ) : (
              filteredDetentionList.map((row) => (
                <tr key={row.studentId}>
                  <td>{row.studentName}</td>
                  <td>{row.classLabel}</td>
                  <td>{row.presentDays}</td>
                  <td>{row.totalDays}</td>
                  <td style={{ color: "var(--eduos-danger)", fontWeight: 600 }}>
                    {row.percent}%
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <section className="eduos-panel">
        <h2 style={{ fontSize: "1rem", fontWeight: 600, margin: "0 0 0.5rem" }}>
          Threshold &amp; shortage report
        </h2>
        <p style={{ fontSize: "0.8125rem", color: "var(--eduos-text-muted)", marginBottom: "1rem" }}>
          All students in the selected section, ranked by attendance % for the selected period.
        </p>
        <table className="eduos-admin-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Class</th>
              <th>%</th>
              <th>Threshold</th>
            </tr>
          </thead>
          <tbody>
            {filteredShortageReport.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ color: "var(--eduos-text-muted)" }}>
                  No attendance records for this period.
                </td>
              </tr>
            ) : (
              filteredShortageReport.map((row) => (
                <tr key={row.studentId}>
                  <td>{row.studentName}</td>
                  <td>{row.classLabel}</td>
                  <td
                    style={{
                      fontWeight: row.percent < row.thresholdPercent ? 600 : 400,
                      color: row.percent < row.thresholdPercent ? "var(--eduos-danger)" : "inherit",
                    }}
                  >
                    {row.percent}%
                  </td>
                  <td>{row.thresholdPercent}%</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <section className="eduos-panel">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          <h2 className="eduos-section-title">
            {period === "weekly" ? "Weekly by student" : "Monthly by student"}
          </h2>
          <Button
            type="button"
            disabled={!reportQuery}
            onClick={() => reportQuery && onExportPeriod(reportQuery)}
          >
            Export CSV
          </Button>
        </div>
        {filteredPeriodReports.length === 0 ? (
          <p style={{ color: "var(--eduos-text-muted)", margin: 0 }}>No records for this period.</p>
        ) : (
          <div style={{ border: "1px solid var(--eduos-border)", borderRadius: "var(--eduos-radius)", overflow: "hidden" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "14% 32% 16% 10% 10% 10% 8%",
                background: "var(--eduos-table-header-bg, var(--eduos-panel-bg))",
                borderBottom: "1px solid var(--eduos-border)",
                fontWeight: 600,
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                color: "var(--eduos-text-muted)",
                padding: "0 0.75rem",
              }}
            >
              <div style={{ padding: "0.6rem 0.5rem 0.6rem 0" }}>{periodColumnLabel}</div>
              <div style={{ padding: "0.6rem 0.5rem" }}>Student</div>
              <div style={{ padding: "0.6rem 0.5rem" }}>Class</div>
              <div style={{ padding: "0.6rem 0.5rem" }}>Present</div>
              <div style={{ padding: "0.6rem 0.5rem" }}>Days</div>
              <div style={{ padding: "0.6rem 0.5rem" }}>%</div>
              <div style={{ padding: "0.6rem 0 0.6rem 0.5rem" }} />
            </div>
            <div
              ref={periodScrollRef}
              style={{ height: Math.min(filteredPeriodReports.length * 40, 480), overflowY: "auto" }}
            >
              <div style={{ height: periodVirtualizer.getTotalSize(), position: "relative" }}>
                {periodVirtualizer.getVirtualItems().map((vRow) => {
                  const row = filteredPeriodReports[vRow.index]!;
                  const isEven = vRow.index % 2 === 0;
                  return (
                    <div
                      key={vRow.key}
                      style={{
                        position: "absolute",
                        top: 0,
                        transform: `translateY(${vRow.start}px)`,
                        width: "100%",
                        display: "grid",
                        gridTemplateColumns: "14% 32% 16% 10% 10% 10% 8%",
                        background: isEven ? "transparent" : "var(--eduos-table-stripe-bg, rgba(0,0,0,0.02))",
                        borderBottom: "1px solid var(--eduos-border)",
                        fontSize: "0.875rem",
                        padding: "0 0.75rem",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ padding: "0.6rem 0.5rem 0.6rem 0", whiteSpace: "nowrap" }}>{row.period}</div>
                      <div style={{ padding: "0.6rem 0.5rem" }}>{row.studentName}</div>
                      <div style={{ padding: "0.6rem 0.5rem", whiteSpace: "nowrap" }}>{row.classLabel}</div>
                      <div style={{ padding: "0.6rem 0.5rem" }}>{row.presentDays}</div>
                      <div style={{ padding: "0.6rem 0.5rem" }}>{row.totalDays}</div>
                      <div style={{ padding: "0.6rem 0.5rem" }}>{row.percent}%</div>
                      <div style={{ padding: "0.6rem 0 0.6rem 0.5rem" }} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

const STATUS_OPTIONS: AttendanceStatus[] = ["present", "absent", "leave", "excused"];

function idemHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    "Idempotency-Key": `attendance-${Date.now()}`,
  };
}

function statusBadge(status: string): React.CSSProperties {
  const colors: Record<string, string> = {
    present: "#48bb78",
    absent: "#e53e3e",
    late: "#ed8936",
    leave: "#4299e1",
    excused: "#805ad5",
    pending: "#ed8936",
    approved: "#48bb78",
    rejected: "#e53e3e",
  };
  return {
    display: "inline-block",
    padding: "0.15rem 0.45rem",
    borderRadius: "var(--eduos-radius)",
    fontSize: "0.6875rem",
    fontWeight: 600,
    textTransform: "capitalize",
    background: `${colors[status] ?? "#718096"}22`,
    color: colors[status] ?? "inherit",
  };
}

export function AttendanceView() {
  const [tab, setTab] = useState<Tab>("Live");
  const [message, setMessage] = useState<string | null>(null);
  const [correctRecord, setCorrectRecord] = useState<AttendanceRecord | null>(null);
  const [correctStatus, setCorrectStatus] = useState<AttendanceStatus>("present");
  const [correctNote, setCorrectNote] = useState("");
  const [reviewLeave, setReviewLeave] = useState<LeaveRequest | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [reportQuery, setReportQuery] = useState<AttendanceReportQuery | null>(null);
  const [markBatchId, setMarkBatchId] = useState<string | undefined>();
  const [markDate, setMarkDate] = useState<string | undefined>();

  // Main data: base URL, or report-filtered while the Reports tab is active. Keyed by
  // the URL so each report query caches separately (instant revisits).
  const effectiveQuery = tab === "Reports" ? reportQuery : null;
  const attendanceUrl = effectiveQuery
    ? `/api/admin/attendance?${reportQueryString(effectiveQuery)}`
    : "/api/admin/attendance";
  const { data, refetch } = useApiData<AttendanceData>(attendanceUrl);

  const refreshReports = useCallback((query: AttendanceReportQuery) => {
    setReportQuery(query);
  }, []);

  // Live board: poll only while the Live tab is open (paused on blurred tab).
  const { data: live = null } = useApiData<LiveAttendanceSnapshot>("/api/admin/attendance/live", {
    enabled: tab === "Live",
    refetchInterval: POLL_MS,
    staleTime: 0,
  });

  async function patchAction(body: Record<string, unknown>) {
    const res = await fetch("/api/admin/attendance/actions", {
      method: "PATCH",
      credentials: "include",
      headers: idemHeaders(),
      body: JSON.stringify(body),
    });
    if (body.action === "export_monthly" || body.action === "export_detention") {
      if (!res.ok) {
        setMessage("Export failed");
        return null;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        body.action === "export_monthly"
          ? "attendance-monthly-by-subject.csv"
          : "detention-list.csv";
      a.click();
      URL.revokeObjectURL(url);
      setMessage("Download started");
      return null;
    }
    const json = await res.json();
    if (!res.ok) {
      setMessage(json.error ?? "Request failed");
      return null;
    }
    // The current query key already reflects tab/reportQuery, so a refetch reloads the
    // right view with fresh rules (no manual merge needed).
    await refetch();
    return json;
  }

  async function submitCorrection() {
    if (!correctRecord) return;
    const result = await patchAction({
      action: "correct_record",
      payload: {
        recordId: correctRecord.id,
        newStatus: correctStatus,
        note: correctNote,
      },
    });
    if (result) {
      setMessage("Attendance record corrected; audit entry created.");
      setCorrectRecord(null);
      setCorrectNote("");
    }
  }

  async function submitLeaveReview(approve: boolean) {
    if (!reviewLeave) return;
    const result = await patchAction({
      action: "review_leave",
      payload: {
        requestId: reviewLeave.id,
        approve,
        reviewNote,
      },
    });
    if (result) {
      setMessage(approve ? "Leave approved." : "Leave rejected.");
      setReviewLeave(null);
      setReviewNote("");
    }
  }

  const pastRecords =
    data?.records.filter((r) => r.date < new Date().toISOString().slice(0, 10)).slice(0, 50) ?? [];

  const studentRowFields = (row: { studentName: string; classLabel?: string; studentId?: string }) => [
    row.studentName,
    row.classLabel,
    row.studentId,
  ];

  const filteredPastRecords = useMemo(
    () =>
      filterBySearch(pastRecords, studentSearch, (r) => [
        r.studentName,
        r.classLabel,
        r.subjectName,
      ]),
    [pastRecords, studentSearch],
  );

  const filteredAuditLog = useMemo(
    () =>
      filterBySearch(data?.auditLog ?? [], studentSearch, (entry) => [
        entry.studentName,
        entry.classLabel,
        entry.subjectName,
        entry.note,
      ]),
    [data?.auditLog, studentSearch],
  );

  return (
    <AdminShell title="Attendance">
      <AdminMessage>{message}</AdminMessage>

      <AdminTabs
        tabs={tabs.map((t) => ({ id: t, label: t }))}
        active={tab}
        onChange={(t) => {
          setTab(t);
          setMessage(null);
        }}
      />

      {!data ? (
        <p style={{ color: "var(--eduos-text-muted)" }}>Loading attendance…</p>
      ) : tab === "Live" ? (
        <section className="eduos-panel">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1rem",
              flexWrap: "wrap",
              gap: "0.5rem",
            }}
          >
            <h2 className="eduos-section-title">Today&apos;s live attendance</h2>
            {live ? (
              <span style={{ fontSize: "0.75rem", color: "var(--eduos-text-muted)" }}>
                Refreshes every {POLL_MS / 1000}s · {new Date(live.updatedAt).toLocaleTimeString()}
              </span>
            ) : null}
          </div>
          {live ? (
            <>
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", marginBottom: "1.25rem" }}>
                <span style={{ fontSize: "2.5rem", fontWeight: 700, color: "var(--eduos-primary)" }}>
                  {live.percent}%
                </span>
                <span style={{ color: "var(--eduos-text-muted)", fontSize: "0.875rem" }}>
                  {live.present} of {live.total} students marked present across all classes today
                </span>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                  gap: "0.75rem",
                }}
              >
                {live.classes.map((c) => (
                  <div
                    key={c.classId}
                    style={{
                      padding: "0.75rem",
                      background: "var(--eduos-bg)",
                      borderRadius: "var(--eduos-radius)",
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{c.classLabel}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--eduos-text-muted)", marginTop: "0.25rem" }}>
                      {c.present}/{c.total} present (
                      {c.total > 0 ? Math.round((c.present / c.total) * 100) : 0}%)
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setMarkBatchId(c.classId);
                        setMarkDate(new Date().toISOString().slice(0, 10));
                        setTab("Mark");
                        setMessage(null);
                      }}
                      style={{
                        marginTop: "0.5rem",
                        padding: 0,
                        border: "none",
                        background: "none",
                        color: "var(--eduos-primary)",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                    >
                      Mark class
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p style={{ color: "var(--eduos-text-muted)" }}>Loading live feed…</p>
          )}
        </section>
      ) : null}

      {data && tab === "Mark" ? (
        <AdminMarkAttendancePanel
          key={`${markBatchId ?? ""}-${markDate ?? ""}`}
          classSections={data.classSections ?? []}
          initialBatchId={markBatchId}
          initialDate={markDate}
          onMessage={setMessage}
        />
      ) : null}

      {data && tab === "Leave" ? (
        <LeaveTab
          data={data}
          studentSearch={studentSearch}
          onStudentSearchChange={setStudentSearch}
          onReview={setReviewLeave}
        />
      ) : null}

      {data && tab === "Reports" ? (
        <ReportsTab
          data={data}
          studentSearch={studentSearch}
          onStudentSearchChange={setStudentSearch}
          onRefresh={refreshReports}
          onExportDetention={(query) =>
            patchAction({ action: "export_detention", reportQuery: query })
          }
          onExportPeriod={(query) => patchAction({ action: "export_monthly", reportQuery: query })}
        />
      ) : null}

      {data && tab === "Audit" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <ListSearchBar
            value={studentSearch}
            onChange={setStudentSearch}
            placeholder="Search student, class, or subject…"
            total={data.auditLog.length + pastRecords.length}
            filtered={filteredAuditLog.length + filteredPastRecords.length}
          />
          <section className="eduos-panel">
            <h2 style={{ fontSize: "1rem", fontWeight: 600, margin: "0 0 0.5rem" }}>Audit log</h2>
            <p style={{ fontSize: "0.8125rem", color: "var(--eduos-text-muted)", marginBottom: "1rem" }}>
              Retroactive edits preserve the original status. Marks made more than 2 hours after class end
              are flagged automatically.
            </p>
            <table className="eduos-admin-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Student</th>
                  <th>Class / Subject</th>
                  <th>Date</th>
                  <th>Detail</th>
                </tr>
              </thead>
              <tbody>
                {data.auditLog.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ color: "var(--eduos-text-muted)" }}>
                      No audit entries yet.
                    </td>
                  </tr>
                ) : (
                  filteredAuditLog.map((entry) => (
                    <AuditRow key={entry.id} entry={entry} />
                  ))
                )}
              </tbody>
            </table>
          </section>

          <section className="eduos-panel">
            <h2 style={{ fontSize: "1rem", fontWeight: 600, margin: "0 0 1rem" }}>
              Retroactive correction (past records)
            </h2>
            <table className="eduos-admin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Student</th>
                  <th>Class</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filteredPastRecords.map((r) => (
                  <tr key={r.id}>
                    <td>{r.date}</td>
                    <td>{r.studentName}</td>
                    <td>{r.classLabel}</td>
                    <td>{r.subjectName}</td>
                    <td>
                      <span style={statusBadge(r.status)}>{r.status}</span>
                      {r.isExamDay ? (
                        <span
                          style={{
                            marginLeft: "0.35rem",
                            fontSize: "0.625rem",
                            color: "var(--eduos-text-muted)",
                          }}
                        >
                          exam
                        </span>
                      ) : null}
                    </td>
                    <td>
                      <Button
                        type="button"
                        onClick={() => {
                          setCorrectRecord(r);
                          setCorrectStatus(r.status);
                          setCorrectNote("");
                        }}
                      >
                        Correct
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      ) : null}

      {data && tab === "Rules" ? (
        <section className="eduos-panel">
          <h2 style={{ fontSize: "1rem", fontWeight: 600, margin: "0 0 1rem" }}>Attendance rules</h2>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const threshold = Number(fd.get("threshold"));
              const examDay = fd.get("examDayRule") === "yes";
              await patchAction({ action: "set_threshold", thresholdPercent: threshold });
              await patchAction({ action: "set_exam_day_rule", examDayCountsTowardThreshold: examDay });
              setMessage("Rules updated.");
            }}
            style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "420px" }}
          >
            <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.875rem" }}>
              Minimum attendance threshold (%)
              <Input
                name="threshold"
                type="number"
                min={0}
                max={100}
                defaultValue={data.rules.thresholdPercent}
                required
              />
            </label>
            <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
              <legend style={{ fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                Exam-day sessions count toward threshold
              </legend>
              <label style={{ display: "flex", gap: "0.5rem", alignItems: "center", fontSize: "0.875rem" }}>
                <input
                  type="radio"
                  name="examDayRule"
                  value="yes"
                  defaultChecked={data.rules.examDayCountsTowardThreshold}
                />
                Yes — include exam days
              </label>
              <label
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  alignItems: "center",
                  fontSize: "0.875rem",
                  marginTop: "0.35rem",
                }}
              >
                <input
                  type="radio"
                  name="examDayRule"
                  value="no"
                  defaultChecked={!data.rules.examDayCountsTowardThreshold}
                />
                No — exclude exam days from threshold calculation
              </label>
            </fieldset>
            <Button type="submit">Save rules</Button>
          </form>
        </section>
      ) : null}

      {correctRecord ? (
        <AdminModal title="Correct attendance" onClose={() => setCorrectRecord(null)}>
          <p style={{ fontSize: "0.875rem", marginBottom: "1rem" }}>
            {correctRecord.studentName} · {correctRecord.classLabel} · {correctRecord.subjectName} ·{" "}
            {correctRecord.date}
          </p>
          <label style={{ display: "block", marginBottom: "0.75rem", fontSize: "0.875rem" }}>
            New status
            <select
              value={correctStatus}
              onChange={(e) => setCorrectStatus(e.target.value as AttendanceStatus)}
              style={{
                display: "block",
                width: "100%",
                marginTop: "0.35rem",
                padding: "0.5rem",
                borderRadius: "var(--eduos-radius)",
                border: "1px solid var(--eduos-border)",
              }}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: "block", marginBottom: "1rem", fontSize: "0.875rem" }}>
            Note (audit)
            <Input
              value={correctNote}
              onChange={(e) => setCorrectNote(e.target.value)}
              placeholder="Reason for correction"
              style={{ marginTop: "0.35rem" }}
            />
          </label>
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
            <Button type="button" onClick={() => setCorrectRecord(null)}>
              Cancel
            </Button>
            <Button type="button" onClick={submitCorrection}>
              Save correction
            </Button>
          </div>
        </AdminModal>
      ) : null}

      {reviewLeave ? (
        <AdminModal title="Review leave request" onClose={() => setReviewLeave(null)}>
          <p style={{ fontSize: "0.875rem", marginBottom: "0.5rem" }}>
            <strong>{reviewLeave.studentName}</strong> · {reviewLeave.classLabel}
          </p>
          <p style={{ fontSize: "0.8125rem", color: "var(--eduos-text-muted)", marginBottom: "0.5rem" }}>
            {reviewLeave.fromDate} – {reviewLeave.toDate}: {reviewLeave.reason}
          </p>
          <p style={{ fontSize: "0.8125rem", color: "var(--eduos-text-muted)", marginBottom: "1rem" }}>
            Applied by {reviewLeave.appliedByName} ({reviewLeave.appliedByRole})
          </p>
          <label style={{ display: "block", marginBottom: "1rem", fontSize: "0.875rem" }}>
            Review note
            <Input
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              style={{ marginTop: "0.35rem" }}
            />
          </label>
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
            <Button type="button" onClick={() => setReviewLeave(null)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => submitLeaveReview(false)}>
              Reject
            </Button>
            <Button type="button" onClick={() => submitLeaveReview(true)}>
              Approve
            </Button>
          </div>
        </AdminModal>
      ) : null}
    </AdminShell>
  );
}

function AuditRow({ entry }: { entry: AttendanceAuditEntry }) {
  const typeLabel = entry.type === "retroactive_edit" ? "Retroactive edit" : "Late marking";
  let detail = entry.note;
  if (entry.type === "retroactive_edit" && entry.originalStatus && entry.newStatus) {
    detail = `${entry.originalStatus} → ${entry.newStatus}. ${entry.note}`;
  }
  if (entry.type === "late_marking" && entry.hoursAfterClassEnd != null) {
    detail = `${entry.hoursAfterClassEnd}h after class end (${entry.classEndTime}). ${entry.note}`;
  }
  if (entry.attributionToUserId) {
    detail = `${detail} · attribution_to=${entry.attributionToUserId}`;
  }
  return (
    <tr>
      <td>
        <span style={statusBadge(entry.type === "late_marking" ? "late" : "excused")}>{typeLabel}</span>
      </td>
      <td>{entry.studentName}</td>
      <td>
        {entry.classLabel} / {entry.subjectName}
      </td>
      <td>{entry.date}</td>
      <td>{detail}</td>
    </tr>
  );
}
