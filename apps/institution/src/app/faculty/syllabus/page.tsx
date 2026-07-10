"use client";

import type { FacultySyllabusProgressData, FacultySyllabusSubject } from "@eduos/types";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FacultyShell } from "@/components/faculty/FacultyShell";
import { useApiData } from "@/lib/queries";
import { Button, InlineLoading } from "@eduos/ui";

const SYLLABUS_URL = "/api/faculty/syllabus";

const cardStyle: React.CSSProperties = {
  background: "var(--eduos-card)",
  border: "1px solid var(--eduos-border)",
  borderRadius: "var(--eduos-radius-lg)",
  padding: "1.25rem",
};

function SubjectCard({
  subject,
  onToggle,
  saving,
}: {
  subject: FacultySyllabusSubject;
  onToggle: (subjectId: string, batchId: string, unitId: string, checked: boolean) => void;
  saving: string | null;
}) {
  const units = [...subject.syllabusUnits].sort((a, b) => a.order - b.order);

  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: "1rem" }}>{subject.name}</div>
          <div style={{ fontSize: "0.8125rem", color: "var(--eduos-text-muted)", marginTop: "0.25rem" }}>
            {subject.code} · {subject.classLabel || "—"}
          </div>
        </div>
        <div style={{ fontWeight: 800, color: "var(--eduos-primary)", fontSize: "1.125rem" }}>
          {subject.syllabusCompletionPercent}%
        </div>
      </div>

      <div
        style={{
          height: 8,
          borderRadius: 4,
          background: "var(--eduos-border)",
          marginTop: "0.75rem",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${subject.syllabusCompletionPercent}%`,
            background: "var(--eduos-primary)",
            borderRadius: 4,
            transition: "width 0.2s ease",
          }}
        />
      </div>

      {units.length === 0 ? (
        <p style={{ margin: "0.75rem 0 0", fontSize: "0.8125rem", color: "var(--eduos-text-muted)" }}>
          No syllabus units defined for this subject.
        </p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: "0.75rem 0 0", fontSize: "0.875rem" }}>
          {units.map((u) => {
            const done = subject.completedUnitIds.includes(u.id);
            const busy = saving === `${subject.batchId}:${subject.id}:${u.id}`;
            return (
              <li key={u.id} style={{ marginBottom: "0.5rem" }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    cursor: busy ? "wait" : "pointer",
                    opacity: busy ? 0.6 : 1,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={done}
                    disabled={!!saving}
                    onChange={(e) => onToggle(subject.id, subject.batchId, u.id, e.target.checked)}
                  />
                  <span style={{ textDecoration: done ? "line-through" : "none", opacity: done ? 0.75 : 1 }}>
                    {u.title}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function FacultySyllabusPage() {
  const queryClient = useQueryClient();
  const { data, error: queryError, refetch } = useApiData<FacultySyllabusProgressData>(SYLLABUS_URL);
  const load = refetch;
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  const error = mutationError ?? (queryError ? "Failed to load syllabus progress." : null);

  async function toggleUnit(subjectId: string, batchId: string, unitId: string, checked: boolean) {
    const subject = data?.subjects.find((s) => s.id === subjectId && s.batchId === batchId);
    if (!subject) return;
    setSaving(`${batchId}:${subjectId}:${unitId}`);
    setMessage(null);
    const completedUnitIds = checked
      ? [...new Set([...subject.completedUnitIds, unitId])]
      : subject.completedUnitIds.filter((id) => id !== unitId);

    const res = await fetch("/api/faculty/syllabus", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subjectId, batchId, completedUnitIds }),
    });
    const json = await res.json().catch(() => ({}));
    setSaving(null);
    if (!res.ok) {
      setMutationError((json as { error?: string }).error ?? "Update failed");
      return;
    }
    const updated = (json as { subject?: FacultySyllabusSubject }).subject;
    if (updated) {
      queryClient.setQueryData<FacultySyllabusProgressData>(["api", SYLLABUS_URL], (prev) =>
        prev
          ? {
              subjects: prev.subjects.map((s) =>
                s.id === updated.id && s.batchId === updated.batchId ? updated : s,
              ),
            }
          : prev,
      );
    } else {
      await load();
    }
    setMessage("Syllabus progress saved.");
  }

  return (
    <FacultyShell title="Syllabus completion">
      {error ? <p style={{ color: "var(--eduos-danger)" }}>{error}</p> : null}
      {message ? <p style={{ color: "var(--eduos-primary)" }}>{message}</p> : null}

      {!data ? (
        <InlineLoading />
      ) : data.subjects.length === 0 ? (
        <p style={{ color: "var(--eduos-text-muted)" }}>No assigned subjects with syllabus tracking yet.</p>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {data.subjects.map((s) => (
            <SubjectCard
              key={`${s.batchId}:${s.id}`}
              subject={s}
              saving={saving}
              onToggle={toggleUnit}
            />
          ))}
        </div>
      )}

      <div style={{ marginTop: "1rem" }}>
        <Button type="button" variant="secondary" onClick={() => void load()}>
          Refresh
        </Button>
      </div>
    </FacultyShell>
  );
}
