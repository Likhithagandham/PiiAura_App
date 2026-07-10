import { useMemo, useState } from "react";
import type {
  ExamSlot,
  ExaminationsData,
  SeatingGenerateMode,
  SeatingPlan,
  SeatingPreflightResult,
} from "@eduos/types";
import { Button } from "@eduos/ui";
import { sectionGradeKey } from "./examUtils";

export function SeatingTab({
  data,
  seatingBySlot,
  onPreflight,
  onGenerateBulk,
  onExportCsv,
}: {
  data: ExaminationsData;
  seatingBySlot: Map<string, SeatingPlan>;
  onPreflight: (examSlotIds: string[]) => Promise<SeatingPreflightResult | null>;
  onGenerateBulk: (payload: {
    examSlotIds?: string[];
    mode: SeatingGenerateMode;
    hallRoomId?: string;
  }) => Promise<{ seatingPlans: SeatingPlan[]; errors: { examSlotId: string }[] } | null>;
  onExportCsv: (plans: SeatingPlan[]) => void;
}) {
  const [filterDate, setFilterDate] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [filterGrade, setFilterGrade] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<SeatingGenerateMode>("per_slot");
  const [hallRoomId, setHallRoomId] = useState("");
  const [preflight, setPreflight] = useState<SeatingPreflightResult | null>(null);
  const [lastErrors, setLastErrors] = useState<{ examSlotId: string }[]>([]);

  const gradeOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of data.classSections ?? []) {
      const key = sectionGradeKey(c);
      if (!map.has(key)) map.set(key, c.grade ?? c.label);
    }
    return [...map.entries()].map(([key, label]) => ({ key, label }));
  }, [data.classSections]);

  const subjectOptions = useMemo(() => {
    const set = new Set(data.slots.map((s) => s.subjectName));
    return [...set].sort();
  }, [data.slots]);

  const dateOptions = useMemo(() => {
    const set = new Set(data.slots.map((s) => s.date));
    return [...set].sort();
  }, [data.slots]);

  const visibleSlots = useMemo(() => {
    return data.slots.filter((slot) => {
      if (filterDate && slot.date !== filterDate) return false;
      if (filterSubject && slot.subjectName !== filterSubject) return false;
      if (filterGrade) {
        const section = data.classSections?.find((c) => c.id === slot.classSectionId);
        if (!section || sectionGradeKey(section) !== filterGrade) return false;
      }
      return true;
    });
  }, [data.slots, data.classSections, filterDate, filterSubject, filterGrade]);

  const selectedSlotIds = useMemo(() => {
    if (selected.size > 0) return [...selected];
    return visibleSlots.map((s) => s.id);
  }, [selected, visibleSlots]);

  const selectStyle = {
    padding: "0.5rem",
    borderRadius: "var(--eduos-radius)",
    border: "1px solid var(--eduos-border)",
    background: "var(--eduos-card)",
    fontSize: "0.8125rem",
  } as const;

  function toggleSlot(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function planStatus(slot: ExamSlot) {
    const plan = seatingBySlot.get(slot.id);
    if (!plan) return "Not generated";
    return `${plan.totalStudents} students · ${plan.allocations.length} room(s)`;
  }

  async function handlePreflight() {
    const result = await onPreflight(selectedSlotIds);
    if (result) setPreflight(result);
  }

  async function handleGenerate(scope: "selected" | "all") {
    const ids = scope === "selected" && selected.size > 0 ? [...selected] : visibleSlots.map((s) => s.id);
    if (mode === "combined" && !hallRoomId) return;
    const result = await onGenerateBulk({
      examSlotIds: ids,
      mode,
      hallRoomId: mode === "combined" ? hallRoomId : undefined,
    });
    if (result) setLastErrors(result.errors);
  }

  return (
    <section className="eduos-panel">
      <h2 className="eduos-section-title">Seating arrangement</h2>
      <p style={{ margin: "0.35rem 0 1rem", fontSize: "0.8125rem", color: "var(--eduos-text-muted)" }}>
        Plan seating for unit tests across all classes. Use filters to narrow slots, check readiness, then
        generate with random seat order — per class or combined hall.
      </p>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
          marginBottom: "1rem",
          alignItems: "flex-end",
        }}
      >
        <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem", fontSize: "0.8125rem" }}>
          Date
          <select value={filterDate} onChange={(e) => setFilterDate(e.target.value)} style={selectStyle}>
            <option value="">All dates</option>
            {dateOptions.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem", fontSize: "0.8125rem" }}>
          Subject
          <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)} style={selectStyle}>
            <option value="">All subjects</option>
            {subjectOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem", fontSize: "0.8125rem" }}>
          Grade
          <select value={filterGrade} onChange={(e) => setFilterGrade(e.target.value)} style={selectStyle}>
            <option value="">All grades</option>
            {gradeOptions.map((g) => (
              <option key={g.key} value={g.key}>
                {g.label}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem", fontSize: "0.8125rem" }}>
          Mode
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as SeatingGenerateMode)}
            style={selectStyle}
          >
            <option value="per_slot">Per class / room</option>
            <option value="combined">Combined hall</option>
          </select>
        </label>
        {mode === "combined" ? (
          <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem", fontSize: "0.8125rem" }}>
            Hall room
            <select value={hallRoomId} onChange={(e) => setHallRoomId(e.target.value)} style={selectStyle}>
              <option value="">Select hall…</option>
              {data.rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.capacity})
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
        <Button type="button" onClick={handlePreflight}>
          Check readiness
        </Button>
        <Button type="button" onClick={() => handleGenerate("selected")}>
          Generate selected
        </Button>
        <Button type="button" onClick={() => handleGenerate("all")}>
          Generate all visible
        </Button>
        <Button
          type="button"
          onClick={() =>
            onExportCsv(visibleSlots.map((s) => seatingBySlot.get(s.id)).filter(Boolean) as SeatingPlan[])
          }
        >
          Export CSV
        </Button>
      </div>

      {preflight ? (
        <div
          style={{
            marginBottom: "1rem",
            padding: "0.75rem",
            background: "var(--eduos-bg)",
            borderRadius: "var(--eduos-radius)",
            fontSize: "0.8125rem",
          }}
        >
          <strong>
            Readiness: {preflight.readyCount}/{preflight.totalSlots} slots ready
          </strong>
          <ul style={{ margin: "0.5rem 0 0", paddingLeft: "1.1rem" }}>
            {preflight.items.map((item) => (
              <li key={item.examSlotId} style={{ color: item.status === "ready" ? undefined : "var(--eduos-danger)" }}>
                {item.classLabel} · {item.subjectName}: {item.registeredCount} students
                {item.issues.length ? ` — ${item.issues.join("; ")}` : ""}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {lastErrors.length > 0 ? (
        <div style={{ marginBottom: "1rem", color: "var(--eduos-danger)", fontSize: "0.8125rem" }}>
          {lastErrors.length} slot(s) failed to generate. Check registrations and room capacity.
        </div>
      ) : null}

      {visibleSlots.length === 0 ? (
        <p style={{ color: "var(--eduos-text-muted)" }}>No exam slots match these filters.</p>
      ) : (
        <table className="eduos-admin-table">
          <thead>
            <tr>
              <th />
              <th>Class</th>
              <th>Subject</th>
              <th>When</th>
              <th>Room</th>
              <th>Plan</th>
            </tr>
          </thead>
          <tbody>
            {visibleSlots.map((slot) => (
              <tr key={slot.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selected.has(slot.id)}
                    onChange={() => toggleSlot(slot.id)}
                    aria-label={`Select ${slot.classLabel}`}
                  />
                </td>
                <td>{slot.classLabel}</td>
                <td>{slot.subjectName}</td>
                <td>
                  {slot.date} {slot.startTime}–{slot.endTime}
                </td>
                <td>{slot.roomName}</td>
                <td style={{ color: "var(--eduos-text-muted)" }}>{planStatus(slot)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {data.seatingPlans.length > 0 ? (
        <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {data.seatingPlans
            .filter((p) => visibleSlots.some((s) => s.id === p.examSlotId))
            .map((p) => {
              const slot = visibleSlots.find((s) => s.id === p.examSlotId);
              return (
                <div
                  key={p.examSlotId}
                  style={{
                    padding: "0.75rem",
                    background: "var(--eduos-bg)",
                    borderRadius: "var(--eduos-radius)",
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: "0.875rem" }}>
                    {slot?.classLabel ?? "Class"} · {slot?.subjectName ?? "Exam"} — {p.totalStudents} students
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--eduos-text-muted)", marginTop: "0.25rem" }}>
                    {p.note}
                  </div>
                  {p.allocations.map((alloc) => (
                    <div key={alloc.roomId} style={{ marginTop: "0.5rem", fontSize: "0.8125rem" }}>
                      <div style={{ fontWeight: 600 }}>{alloc.roomName}</div>
                      <div style={{ color: "var(--eduos-text-muted)" }}>
                        {alloc.seats.map((s) => `${s.seatNo}. ${s.studentName}`).join(" · ")}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
        </div>
      ) : null}
    </section>
  );
}
