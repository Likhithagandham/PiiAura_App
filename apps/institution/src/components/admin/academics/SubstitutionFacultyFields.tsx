"use client";

import { useEffect } from "react";
import type { AcademicsData } from "@eduos/types";
import { Input, Spinner } from "@eduos/ui";
import { facultyDisplayName, formatSessionLabel, sessionsForDate } from "./substitution-helpers";
import { useSubstitutionAvailability } from "./useSubstitutionAvailability";

export function SubstitutionFacultyFields({
  data,
  date,
  timetableSlotId,
  substituteFacultyUserId,
  reason,
  onDateChange,
  onSlotChange,
  onSubstituteChange,
  onReasonChange,
  showSessionPicker = true,
}: {
  data: AcademicsData;
  date: string;
  timetableSlotId: string;
  substituteFacultyUserId: string;
  reason: string;
  onDateChange: (date: string) => void;
  onSlotChange: (slotId: string) => void;
  onSubstituteChange: (userId: string) => void;
  onReasonChange: (reason: string) => void;
  showSessionPicker?: boolean;
}) {
  const sessions = sessionsForDate(data.timetableSlots, date);
  const { availability, loading, error } = useSubstitutionAvailability(timetableSlotId, date);

  useEffect(() => {
    if (!availability) return;
    const ids = availability.availableFaculty.map((f) => f.userId);
    if (substituteFacultyUserId && ids.includes(substituteFacultyUserId)) return;
    onSubstituteChange(ids[0] ?? "");
  }, [availability, substituteFacultyUserId, onSubstituteChange]);

  const assignedName =
    availability?.originalFacultyName ??
    (timetableSlotId
      ? facultyDisplayName(
          data,
          data.timetableSlots.find((s) => s.id === timetableSlotId)?.facultyUserId ?? "",
        )
      : "—");

  return (
    <div style={{ display: "grid", gap: "0.75rem" }}>
      <Input label="Date" type="date" value={date} onChange={(e) => onDateChange(e.target.value)} />

      {showSessionPicker ? (
        <label className="eduos-label">
          Session
          <select
            className="eduos-input"
            value={timetableSlotId}
            onChange={(e) => onSlotChange(e.target.value)}
          >
            {sessions.length === 0 ? (
              <option value="">No classes on this day</option>
            ) : (
              sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {formatSessionLabel(s, data)}
                </option>
              ))
            )}
          </select>
        </label>
      ) : null}

      {timetableSlotId ? (
        <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--eduos-text-muted)" }}>
          Assigned teacher: <strong style={{ color: "var(--eduos-text)" }}>{assignedName}</strong>
        </p>
      ) : null}

      <label className="eduos-label">
        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
          Substitute faculty
          {loading ? <Spinner size="sm" /> : null}
        </span>
        <select
          className="eduos-input"
          value={substituteFacultyUserId}
          onChange={(e) => onSubstituteChange(e.target.value)}
          disabled={!timetableSlotId || loading || !availability?.availableFaculty.length}
        >
          {loading ? <option value="" disabled /> : null}
          {!loading && availability?.availableFaculty.length === 0 ? (
            <option value="">No teachers available for this period</option>
          ) : null}
          {(availability?.availableFaculty ?? []).map((f) => (
            <option key={f.userId} value={f.userId}>
              {f.name}
            </option>
          ))}
        </select>
      </label>

      {error ? (
        <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--eduos-danger)" }}>{error}</p>
      ) : null}

      <Input label="Reason" value={reason} onChange={(e) => onReasonChange(e.target.value)} />
    </div>
  );
}
