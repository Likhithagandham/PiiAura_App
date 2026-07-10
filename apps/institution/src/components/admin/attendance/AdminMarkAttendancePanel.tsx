"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  AdminMarkAttendanceContext,
  AttendanceRecord,
  ClassBatchSection,
} from "@eduos/types";
import { Button, InlineLoading } from "@eduos/ui";
import { useApiData } from "@/lib/queries";
import { useClassSectionFilters } from "./useClassSectionFilters";

type Mode = "present" | "absent";

const cardStyle: React.CSSProperties = {
  background: "var(--eduos-card)",
  border: "1px solid var(--eduos-border)",
  borderRadius: "var(--eduos-radius-lg)",
  padding: "0.75rem",
};

const PRESENT = "#16a34a";
const ABSENT = "var(--eduos-danger)";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatDisplayDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function markQueryString(params: {
  date: string;
  batchId: string;
  batchSubjectId?: string;
  periodSlotId?: string;
}): string {
  const qs = new URLSearchParams();
  qs.set("date", params.date);
  qs.set("batchId", params.batchId);
  if (params.batchSubjectId) qs.set("batchSubjectId", params.batchSubjectId);
  if (params.periodSlotId) qs.set("periodSlotId", params.periodSlotId);
  return qs.toString();
}

export function AdminMarkAttendancePanel({
  classSections,
  initialBatchId,
  initialDate,
  onMessage,
}: {
  classSections: ClassBatchSection[];
  initialBatchId?: string;
  initialDate?: string;
  onMessage: (message: string | null) => void;
}) {
  const [markDate, setMarkDate] = useState(initialDate ?? todayIso());
  const [subjectId, setSubjectId] = useState("");
  const [periodSlotId, setPeriodSlotId] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [mode, setMode] = useState<Mode>("present");
  const [exceptions, setExceptions] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");

  const {
    gradeKey,
    setGradeKey,
    sectionId,
    setSectionId,
    gradeOptions,
    sectionsForGrade,
    selectSectionById,
  } = useClassSectionFilters(classSections);

  useEffect(() => {
    if (initialBatchId) selectSectionById(initialBatchId);
  }, [initialBatchId, selectSectionById]);

  useEffect(() => {
    if (initialDate) setMarkDate(initialDate);
  }, [initialDate]);

  const markUrl = useMemo(() => {
    const qs = sectionId
      ? markQueryString({
          date: markDate,
          batchId: sectionId,
          batchSubjectId: subjectId || undefined,
          periodSlotId: periodSlotId || undefined,
        })
      : `date=${encodeURIComponent(markDate)}`;
    return `/api/admin/attendance/mark?${qs}`;
  }, [markDate, sectionId, subjectId, periodSlotId]);

  const {
    data,
    error: queryError,
    isFetching: loading,
    refetch,
  } = useApiData<AdminMarkAttendanceContext>(markUrl);
  const loadContext = refetch;
  // Hide the roster (and show the banner) when the current query errored.
  const context = queryError ? null : data ?? null;
  const error = saveError ?? (queryError ? "Failed to load mark context" : null);

  const canLoadRoster = useMemo(() => {
    if (!sectionId || !markDate) return false;
    if (markDate > todayIso()) return false;
    if (context?.mode === "session") return Boolean(subjectId && periodSlotId);
    if (!context) return Boolean(sectionId);
    return true;
  }, [sectionId, markDate, context, subjectId, periodSlotId]);

  const records = useMemo<AttendanceRecord[]>(() => {
    if (!context || !canLoadRoster || context.holiday.blocked) return [];
    return [...context.records].sort((a, b) => a.studentName.localeCompare(b.studentName));
  }, [context, canLoadRoster]);

  useEffect(() => {
    setMode("present");
    setExceptions(new Set(records.filter((r) => r.status === "absent").map((r) => r.id)));
    setQuery("");
  }, [records, context?.sessionId, markDate, sectionId, subjectId, periodSlotId]);

  useEffect(() => {
    if (!context || context.mode !== "session") return;
    const subjects = context.subjects ?? [];
    if (!subjectId && subjects[0]?.id) setSubjectId(subjects[0].id);
    const slots = context.periodSlots ?? [];
    if (!periodSlotId && slots[0]?.id) setPeriodSlotId(slots[0].id);
  }, [context, subjectId, periodSlotId]);

  const statusOf = useCallback(
    (id: string): "present" | "absent" => {
      const isException = exceptions.has(id);
      if (mode === "present") return isException ? "absent" : "present";
      return isException ? "present" : "absent";
    },
    [mode, exceptions],
  );

  const presentCount = useMemo(
    () => records.reduce((n, r) => n + (statusOf(r.id) === "present" ? 1 : 0), 0),
    [records, statusOf],
  );
  const absentCount = records.length - presentCount;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return records;
    return records.filter(
      (r) =>
        r.studentName.toLowerCase().includes(q) ||
        (r.rollNumber ?? "").toLowerCase().includes(q),
    );
  }, [records, query]);

  function toggle(id: string) {
    setExceptions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function setModeClear(m: Mode) {
    setMode(m);
    setExceptions(new Set());
  }

  async function save() {
    if (!context || context.holiday.blocked || records.length === 0) return;
    onMessage(null);
    setSaveError(null);
    setSaving(true);
    const payload = records.map((r) => ({ recordId: r.id, status: statusOf(r.id) }));
    try {
      const res = await fetch("/api/admin/attendance/actions", {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": crypto.randomUUID(),
        },
        body: JSON.stringify({
          action: "bulk_mark",
          records: payload,
          sessionId: context.sessionId,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setSaveError(json.error ?? "Save failed");
        return;
      }
      const label = context.classLabel ?? "class";
      onMessage(
        `Saved — ${presentCount} present, ${absentCount} absent for ${label} on ${formatDisplayDate(markDate)}.`,
      );
      await loadContext();
    } catch {
      setSaveError("Save failed");
    } finally {
      setSaving(false);
    }
  }

  const holidayBlocked = context?.holiday.blocked ?? false;
  const exceptionLabel =
    mode === "present" ? "Tick students who are ABSENT" : "Tick students who are PRESENT";
  const showRoster = sectionId && canLoadRoster && !holidayBlocked;

  return (
    <section className="eduos-panel">
      <h2 style={{ fontSize: "1rem", fontWeight: 600, margin: "0 0 0.5rem" }}>Mark attendance</h2>
      <p style={{ fontSize: "0.8125rem", color: "var(--eduos-text-muted)", marginBottom: "1rem" }}>
        Mark attendance for any class. Pick a date and section, then tick students who are absent
        (or present).
      </p>

      {error ? <p style={{ color: "var(--eduos-danger)", fontSize: "0.875rem" }}>{error}</p> : null}

      {holidayBlocked ? (
        <section
          style={{
            ...cardStyle,
            marginBottom: "0.75rem",
            borderColor: "var(--eduos-danger)",
            background: "color-mix(in srgb, var(--eduos-danger) 8%, var(--eduos-card))",
          }}
        >
          <strong>Holiday — marking blocked</strong>
          <p style={{ margin: "0.35rem 0 0", fontSize: "0.8125rem", color: "var(--eduos-text-muted)" }}>
            Attendance cannot be marked on this date — it&apos;s a declared holiday.
          </p>
        </section>
      ) : null}

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
          <span style={{ fontWeight: 600, color: "var(--eduos-text-muted)" }}>Date</span>
          <input
            type="date"
            value={markDate}
            max={todayIso()}
            onChange={(e) => setMarkDate(e.target.value)}
            className="eduos-input"
          />
        </label>
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
        {context?.mode === "session" ? (
          <>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem" }}>
              <span style={{ fontWeight: 600, color: "var(--eduos-text-muted)" }}>Subject</span>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="eduos-input"
                style={{ minWidth: "10rem" }}
              >
                {(context.subjects ?? []).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem" }}>
              <span style={{ fontWeight: 600, color: "var(--eduos-text-muted)" }}>Period</span>
              <select
                value={periodSlotId}
                onChange={(e) => setPeriodSlotId(e.target.value)}
                className="eduos-input"
                style={{ minWidth: "8rem" }}
              >
                {(context.periodSlots ?? []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
          </>
        ) : null}
        <Button
          type="button"
          variant="secondary"
          onClick={() => void loadContext()}
          disabled={loading}
          style={{ width: "auto", padding: "0.4rem 0.65rem", fontSize: "0.8125rem", fontWeight: 600 }}
        >
          Refresh
        </Button>
      </div>

      {loading && !context ? (
        <InlineLoading />
      ) : !sectionId ? (
        <p className="eduos-empty eduos-empty--sm">Select a date and class to load the student list.</p>
      ) : context?.mode === "session" && (!subjectId || !periodSlotId) ? (
        <p className="eduos-empty eduos-empty--sm">Select a subject and period to load the roster.</p>
      ) : !showRoster ? null : records.length === 0 ? (
        <p className="eduos-empty eduos-empty--sm">No students for this class.</p>
      ) : (
        <section style={cardStyle}>
          {context?.classLabel ? (
            <div style={{ fontSize: "0.8125rem", fontWeight: 700, marginBottom: "0.5rem" }}>
              {context.classLabel}
              {context.subjectName ? ` · ${context.subjectName}` : ""}
            </div>
          ) : null}

          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.6rem" }}>
            <SummaryStat label="Total" value={records.length} color="var(--eduos-text)" />
            <SummaryStat label="Present" value={presentCount} color={PRESENT} />
            <SummaryStat label="Absent" value={absentCount} color={ABSENT} />
          </div>

          <div style={{ display: "flex", gap: "0.4rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
            <ModeButton active={mode === "present"} onClick={() => setModeClear("present")} color={PRESENT}>
              Everyone Present
            </ModeButton>
            <ModeButton active={mode === "absent"} onClick={() => setModeClear("absent")} color={ABSENT}>
              Everyone Absent
            </ModeButton>
          </div>

          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or roll number…"
            className="eduos-input"
            style={{ marginBottom: "0.5rem" }}
          />

          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
            <ChipBtn onClick={() => setModeClear("present")}>Mark All Present</ChipBtn>
            <ChipBtn onClick={() => setModeClear("absent")}>Mark All Absent</ChipBtn>
            <ChipBtn onClick={() => setExceptions(new Set())}>Clear Selection</ChipBtn>
          </div>

          <p style={{ margin: "0 0 0.5rem", fontSize: "0.75rem", color: "var(--eduos-text-muted)" }}>
            {exceptionLabel} · showing {filtered.length} of {records.length}
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.25rem",
              maxHeight: "50vh",
              overflowY: "auto",
            }}
          >
            {filtered.map((r) => {
              const status = statusOf(r.id);
              const ticked = exceptions.has(r.id);
              const isAbsent = status === "absent";
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => toggle(r.id)}
                  disabled={holidayBlocked}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    padding: "0.5rem 0.6rem",
                    borderRadius: "var(--eduos-radius)",
                    border: `1px solid ${ticked ? (isAbsent ? ABSENT : PRESENT) : "var(--eduos-border)"}`,
                    background: ticked
                      ? `color-mix(in srgb, ${isAbsent ? ABSENT : PRESENT} 10%, var(--eduos-bg))`
                      : "var(--eduos-bg)",
                    cursor: holidayBlocked ? "not-allowed" : "pointer",
                    textAlign: "left",
                    width: "100%",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={ticked}
                    readOnly
                    tabIndex={-1}
                    style={{ width: "1.1rem", height: "1.1rem", accentColor: isAbsent ? ABSENT : PRESENT }}
                  />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "block", fontWeight: 600, fontSize: "0.875rem" }}>
                      {r.studentName}
                    </span>
                    {r.rollNumber ? (
                      <span style={{ display: "block", fontSize: "0.75rem", color: "var(--eduos-text-muted)" }}>
                        {r.rollNumber}
                      </span>
                    ) : null}
                  </span>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: isAbsent ? ABSENT : PRESENT,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {isAbsent ? "Absent" : "Present"}
                  </span>
                </button>
              );
            })}
          </div>

          <div
            style={{
              marginTop: "0.6rem",
              paddingTop: "0.6rem",
              borderTop: "1px solid var(--eduos-border)",
              display: "flex",
              gap: "0.5rem",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: "0.8125rem", color: "var(--eduos-text-muted)" }}>
              {presentCount} present · {absentCount} absent
            </span>
            <Button type="button" onClick={() => void save()} disabled={saving || holidayBlocked}>
              {saving ? "Saving…" : "Save attendance"}
            </Button>
          </div>
        </section>
      )}
    </section>
  );
}

function SummaryStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div
      style={{
        padding: "0.35rem 0.6rem",
        borderRadius: "var(--eduos-radius)",
        border: "1px solid var(--eduos-border)",
        fontSize: "0.75rem",
      }}
    >
      <span style={{ color: "var(--eduos-text-muted)" }}>{label}: </span>
      <strong style={{ color }}>{value}</strong>
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  color,
  children,
}: {
  active: boolean;
  onClick: () => void;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "0.35rem 0.65rem",
        borderRadius: "999px",
        border: active ? `2px solid ${color}` : "1px solid var(--eduos-border)",
        background: active ? `color-mix(in srgb, ${color} 12%, transparent)` : "var(--eduos-bg)",
        fontSize: "0.8125rem",
        fontWeight: active ? 700 : 500,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function ChipBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "0.25rem 0.5rem",
        borderRadius: "999px",
        border: "1px solid var(--eduos-border)",
        background: "var(--eduos-bg)",
        fontSize: "0.75rem",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}
