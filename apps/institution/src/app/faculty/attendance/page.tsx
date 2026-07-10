"use client";

import type { AttendanceRecord, FacultyAttendanceData } from "@eduos/types";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { FacultyShell } from "@/components/faculty/FacultyShell";
import { ExportCsvButton } from "@/components/shared/ExportCsvButton";
import { Button, InlineLoading } from "@eduos/ui";
import { bulkMarkAttendanceAction, loadAttendanceAction } from "./actions";

type Mode = "present" | "absent";

const cardStyle: React.CSSProperties = {
  background: "var(--eduos-card)",
  border: "1px solid var(--eduos-border)",
  borderRadius: "var(--eduos-radius-lg)",
  padding: "0.75rem",
};

const PRESENT = "#16a34a";
const ABSENT = "var(--eduos-danger)";

export default function FacultyAttendancePage() {
  return (
    <Suspense fallback={<FacultyShell title="Mark attendance"><InlineLoading /></FacultyShell>}>
      <FacultyAttendanceContent />
    </Suspense>
  );
}

function FacultyAttendanceContent() {
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [data, setData] = useState<FacultyAttendanceData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [sessionKey, setSessionKey] = useState("");

  const [mode, setMode] = useState<Mode>("present");
  // The "exceptions" are students who deviate from the baseline mode.
  const [exceptions, setExceptions] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setError(null);
    startTransition(async () => {
      const result = await loadAttendanceAction();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setData(result.data);
      const urlSession = searchParams.get("session");
      setSessionKey((prev) => {
        const preferred = prev || urlSession || "";
        if (preferred && result.data.sessions.some((s) => `${s.classSectionId}__${s.subjectId}` === preferred)) {
          return preferred;
        }
        const first = result.data.sessions[0];
        return first ? `${first.classSectionId}__${first.subjectId}` : "";
      });
    });
  }, [searchParams]);

  useEffect(() => {
    const t = setTimeout(() => load(), 0);
    return () => clearTimeout(t);
  }, [load]);

  const holidayBlocked = data?.holiday.blocked ?? false;

  const selected = useMemo(() => {
    if (!data || !sessionKey) return null;
    const [classSectionId, subjectId] = sessionKey.split("__");
    return data.sessions.find((s) => s.classSectionId === classSectionId && s.subjectId === subjectId) ?? null;
  }, [data, sessionKey]);

  const records = useMemo<AttendanceRecord[]>(() => {
    if (!data || !selected) return [];
    const set = new Set(selected.recordIds);
    return data.records
      .filter((r) => set.has(r.id))
      .sort((a, b) => a.studentName.localeCompare(b.studentName));
  }, [data, selected]);

  // On (re)load or session switch: default to "Everyone Present", with any
  // already-saved absentees pre-ticked so reopening reflects saved state.
  useEffect(() => {
    setMode("present");
    setExceptions(new Set(records.filter((r) => r.status === "absent").map((r) => r.id)));
    setQuery("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionKey, data]);

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
    if (holidayBlocked || !selected) return;
    setMessage(null);
    setSaving(true);
    const payload = records.map((r) => ({ recordId: r.id, status: statusOf(r.id) }));
    const result = await bulkMarkAttendanceAction(payload);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setMessage(`Saved — ${presentCount} present, ${absentCount} absent.`);
    load();
  }

  const exceptionLabel = mode === "present" ? "Tick students who are ABSENT" : "Tick students who are PRESENT";

  return (
    <FacultyShell title="Mark attendance">
      {error ? <p style={{ color: "var(--eduos-danger)" }}>{error}</p> : null}
      {message ? <p style={{ color: PRESENT, fontSize: "0.875rem" }}>{message}</p> : null}

      {!data ? (
        <InlineLoading />
      ) : (
        <>
          {data.holiday.blocked ? (
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
                {data.holiday.holidayName
                  ? `${data.holiday.holidayName} (${data.date})`
                  : `Institution holiday on ${data.date}`}
                . You cannot mark attendance today.
              </p>
            </section>
          ) : null}

          {/* Date header — unchanged */}
          <section style={{ ...cardStyle, marginBottom: "0.75rem" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "space-between" }}>
              <div style={{ fontSize: "0.8125rem" }}>
                <div style={{ fontWeight: 800 }}>{data.date}</div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                <ExportCsvButton
                  endpoint="/api/faculty/exports/subject-attendance"
                  label="Download my attendance CSV"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={load}
                  disabled={pending}
                  style={{ width: "auto", padding: "0.4rem 0.65rem", fontSize: "0.8125rem", fontWeight: 600 }}
                >
                  Refresh
                </Button>
              </div>
            </div>
          </section>

          {/* Class/session selection — unchanged */}
          <section style={{ ...cardStyle, marginBottom: "0.75rem" }}>
            <div style={{ fontWeight: 800, fontSize: "0.8125rem", marginBottom: "0.35rem" }}>Class session</div>
            <div
              style={{
                display: "flex",
                gap: "0.4rem",
                overflowX: "auto",
                paddingBottom: "0.25rem",
                WebkitOverflowScrolling: "touch",
              }}
            >
              {data.sessions.map((s) => {
                const key = `${s.classSectionId}__${s.subjectId}`;
                const active = sessionKey === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSessionKey(key)}
                    style={{
                      flex: "0 0 auto",
                      padding: "0.35rem 0.65rem",
                      borderRadius: "999px",
                      border: active ? "2px solid var(--eduos-primary)" : "1px solid var(--eduos-border)",
                      background: active ? "color-mix(in srgb, var(--eduos-primary) 12%, transparent)" : "var(--eduos-bg)",
                      fontSize: "0.8125rem",
                      fontWeight: active ? 700 : 500,
                      cursor: "pointer",
                    }}
                  >
                    {s.classLabel} · {s.subjectName}
                  </button>
                );
              })}
            </div>
          </section>

          {records.length === 0 ? (
            <section style={cardStyle}>
              <p className="eduos-empty eduos-empty--sm">No students for this session.</p>
            </section>
          ) : (
            <section style={cardStyle}>
              {/* Summary */}
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.6rem" }}>
                <SummaryStat label="Total" value={records.length} color="var(--eduos-text)" />
                <SummaryStat label="Present" value={presentCount} color={PRESENT} />
                <SummaryStat label="Absent" value={absentCount} color={ABSENT} />
              </div>

              {/* Mode toggle */}
              <div style={{ display: "flex", gap: "0.4rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
                <ModeButton active={mode === "present"} onClick={() => setModeClear("present")} color={PRESENT}>
                  Everyone Present
                </ModeButton>
                <ModeButton active={mode === "absent"} onClick={() => setModeClear("absent")} color={ABSENT}>
                  Everyone Absent
                </ModeButton>
              </div>

              {/* Search */}
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or roll number…"
                className="eduos-input"
                style={{ marginBottom: "0.5rem" }}
              />

              {/* Quick actions */}
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
                <ChipBtn onClick={() => setModeClear("present")}>Mark All Present</ChipBtn>
                <ChipBtn onClick={() => setModeClear("absent")}>Mark All Absent</ChipBtn>
                <ChipBtn onClick={() => setExceptions(new Set())}>Clear Selection</ChipBtn>
              </div>

              <p style={{ margin: "0 0 0.5rem", fontSize: "0.75rem", color: "var(--eduos-text-muted)" }}>
                {exceptionLabel} · showing {filtered.length} of {records.length}
              </p>

              {/* Student list */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", maxHeight: "60vh", overflowY: "auto" }}>
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

              {/* Save bar */}
              <div
                style={{
                  position: "sticky",
                  bottom: 0,
                  marginTop: "0.6rem",
                  paddingTop: "0.6rem",
                  borderTop: "1px solid var(--eduos-border)",
                  background: "var(--eduos-card)",
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
                <Button
                  type="button"
                  onClick={save}
                  disabled={holidayBlocked || saving || pending}
                  style={{ width: "auto", padding: "0.5rem 1.25rem", fontWeight: 700 }}
                >
                  {saving ? "Saving…" : "Save attendance"}
                </Button>
              </div>
            </section>
          )}
        </>
      )}
    </FacultyShell>
  );
}

function SummaryStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: "5rem",
        border: "1px solid var(--eduos-border)",
        borderRadius: "var(--eduos-radius)",
        padding: "0.5rem 0.6rem",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "1.25rem", fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: "0.6875rem", color: "var(--eduos-text-muted)", textTransform: "uppercase", letterSpacing: "0.03em" }}>
        {label}
      </div>
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
        flex: 1,
        minWidth: "8rem",
        padding: "0.45rem 0.6rem",
        borderRadius: "var(--eduos-radius)",
        border: active ? `2px solid ${color}` : "1px solid var(--eduos-border)",
        background: active ? `color-mix(in srgb, ${color} 12%, var(--eduos-bg))` : "var(--eduos-bg)",
        color: active ? color : "var(--eduos-text)",
        fontWeight: active ? 800 : 600,
        fontSize: "0.8125rem",
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
        padding: "0.35rem 0.6rem",
        borderRadius: "999px",
        border: "1px solid var(--eduos-border)",
        background: "var(--eduos-bg)",
        fontSize: "0.75rem",
        fontWeight: 600,
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}
