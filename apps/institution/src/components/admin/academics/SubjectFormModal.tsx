"use client";

import { useState } from "react";
import type { ClassBatchSection, SubjectMaster } from "@eduos/types";
import { Button, Input } from "@eduos/ui";
import { AdminModal } from "../AdminModal";

export interface SubjectFormValues {
  id?: string;
  courseId?: string;
  code: string;
  name: string;
  credits: string;
  units: { id?: string; title: string }[];
}

export function subjectToForm(subject: SubjectMaster): SubjectFormValues {
  return {
    id: subject.id,
    courseId: subject.courseId,
    code: subject.code,
    name: subject.name,
    credits: subject.credits != null ? String(subject.credits) : "3",
    units: subject.syllabusUnits.length
      ? subject.syllabusUnits.map((u) => ({ id: u.id, title: u.title }))
      : [{ title: "" }],
  };
}

export function emptySubjectForm(courseId?: string): SubjectFormValues {
  return { courseId, code: "", name: "", credits: "3", units: [{ title: "" }] };
}

function courseOptions(classSections: ClassBatchSection[]) {
  const seen = new Set<string>();
  const options: { courseId: string; label: string }[] = [];
  for (const c of classSections) {
    const id = c.courseId ?? c.id;
    if (!c.grade || seen.has(id)) continue;
    seen.add(id);
    options.push({ courseId: id, label: c.grade });
  }
  return options.sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }));
}

export function SubjectFormModal({
  isCollege,
  classSections,
  initial,
  onClose,
  onSave,
}: {
  isCollege: boolean;
  classSections: ClassBatchSection[];
  initial: SubjectFormValues;
  onClose: () => void;
  onSave: (values: SubjectFormValues) => Promise<void>;
}) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(form.id);
  const courses = courseOptions(classSections);

  function setUnit(index: number, title: string) {
    const units = [...form.units];
    units[index] = { ...units[index]!, title };
    setForm({ ...form, units });
  }

  function addUnit() {
    setForm({ ...form, units: [...form.units, { title: "" }] });
  }

  function removeUnit(index: number) {
    if (form.units.length <= 1) {
      setForm({ ...form, units: [{ title: "" }] });
      return;
    }
    setForm({ ...form, units: form.units.filter((_, i) => i !== index) });
  }

  function moveUnit(index: number, dir: -1 | 1) {
    const next = index + dir;
    if (next < 0 || next >= form.units.length) return;
    const units = [...form.units];
    [units[index], units[next]] = [units[next]!, units[index]!];
    setForm({ ...form, units });
  }

  async function handleSubmit() {
    const units = form.units.map((u) => ({ id: u.id, title: u.title.trim() })).filter((u) => u.title);
    if (!form.code.trim() || !form.name.trim()) return;
    if (!isEdit && !form.courseId) return;
    if (isCollege && (!form.credits || Number(form.credits) < 1)) return;

    setSaving(true);
    await onSave({ ...form, units });
    setSaving(false);
  }

  return (
    <AdminModal
      title={isEdit ? "Edit subject" : "Add subject"}
      onClose={onClose}
      wide
    >
      <p style={{ fontSize: "0.8125rem", color: "var(--eduos-text-muted)", margin: "0 0 1rem" }}>
        {isCollege
          ? "College subjects require credit hours and can list syllabus units (chapters or modules)."
          : "School subjects use syllabus units only — credits are not used."}
      </p>

      {!isEdit ? (
        <div style={{ marginBottom: "0.75rem" }}>
          <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, marginBottom: "0.35rem" }}>
            {isCollege ? "Program / grade" : "Grade"}
          </label>
          <select
            className="eduos-input"
            value={form.courseId ?? ""}
            onChange={(e) => setForm({ ...form, courseId: e.target.value })}
            style={{ width: "100%" }}
          >
            <option value="">Select…</option>
            {courses.map((c) => (
              <option key={c.courseId} value={c.courseId}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: "0.75rem" }}>
        <Input label="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. MA101" />
        <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Mathematics" />
      </div>

      {isCollege ? (
        <div style={{ marginTop: "0.75rem", maxWidth: 140 }}>
          <Input
            label="Credits"
            type="number"
            min={1}
            max={10}
            value={form.credits}
            onChange={(e) => setForm({ ...form, credits: e.target.value })}
          />
          <p style={{ fontSize: "0.7rem", color: "var(--eduos-text-muted)", margin: "0.25rem 0 0" }}>
            Credit hours for this course (college only)
          </p>
        </div>
      ) : null}

      <div style={{ marginTop: "1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
          <h4 style={{ margin: 0, fontSize: "0.875rem", fontWeight: 600 }}>Syllabus units</h4>
          <Button type="button" variant="secondary" onClick={addUnit}>
            + Add unit
          </Button>
        </div>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {form.units.map((unit, index) => (
            <li
              key={unit.id ?? `new-${index}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem",
                background: "var(--eduos-bg)",
                borderRadius: "var(--eduos-radius)",
              }}
            >
              <span
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: "var(--eduos-primary-light)",
                  color: "var(--eduos-primary)",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {index + 1}
              </span>
              <input
                className="eduos-input"
                style={{ flex: 1, margin: 0 }}
                value={unit.title}
                onChange={(e) => setUnit(index, e.target.value)}
                placeholder={`Unit ${index + 1} title`}
              />
              <button
                type="button"
                title="Move up"
                disabled={index === 0}
                onClick={() => moveUnit(index, -1)}
                style={iconBtn}
              >
                ↑
              </button>
              <button
                type="button"
                title="Move down"
                disabled={index === form.units.length - 1}
                onClick={() => moveUnit(index, 1)}
                style={iconBtn}
              >
                ↓
              </button>
              <button type="button" title="Remove unit" onClick={() => removeUnit(index)} style={{ ...iconBtn, color: "var(--eduos-danger)" }}>
                ×
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: "1.25rem", display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
        <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={saving || !form.code.trim() || !form.name.trim() || (!isEdit && !form.courseId)}
        >
          {saving ? "Saving…" : isEdit ? "Update subject" : "Save subject"}
        </Button>
      </div>
    </AdminModal>
  );
}

const iconBtn: React.CSSProperties = {
  width: 28,
  height: 28,
  border: "1px solid var(--eduos-border)",
  borderRadius: "var(--eduos-radius)",
  background: "var(--eduos-card)",
  cursor: "pointer",
  fontSize: "0.75rem",
  flexShrink: 0,
};
