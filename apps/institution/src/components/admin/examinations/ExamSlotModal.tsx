import type { ExamClash, ExamSlot, ExaminationsData, SaveExamSlotInput } from "@eduos/types";
import { Button, Input } from "@eduos/ui";
import { AdminModal } from "../AdminModal";

export function ExamSlotModal({
  data,
  open,
  editing,
  form,
  clashes,
  onClose,
  onChange,
  onSubmit,
}: {
  data: ExaminationsData;
  open: boolean;
  editing: ExamSlot | null;
  form: SaveExamSlotInput;
  clashes: ExamClash[];
  onClose: () => void;
  onChange: (next: SaveExamSlotInput) => void;
  onSubmit: () => void;
}) {
  if (!open) return null;

  const selectStyle = {
    padding: "0.5rem",
    borderRadius: "var(--eduos-radius)",
    border: "1px solid var(--eduos-border)",
    background: "var(--eduos-card)",
  } as const;

  const classOptions =
    data.classSections?.length
      ? data.classSections.map((c) => ({ id: c.id, label: c.label }))
      : data.classes;

  return (
    <AdminModal title={editing ? "Edit exam slot" : "New exam slot"} onClose={onClose} wide>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.875rem" }}>
          Exam name
          <Input value={form.name} onChange={(e) => onChange({ ...form, name: e.target.value })} />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.875rem" }}>
          Status
          <select
            value={form.status}
            onChange={(e) => onChange({ ...form, status: e.target.value as ExamSlot["status"] })}
            style={selectStyle}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.875rem" }}>
          Class
          <select
            value={form.classSectionId}
            onChange={(e) => onChange({ ...form, classSectionId: e.target.value })}
            style={selectStyle}
          >
            {classOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.875rem" }}>
          Subject
          <select
            value={form.subjectId}
            onChange={(e) => onChange({ ...form, subjectId: e.target.value })}
            style={selectStyle}
          >
            {data.subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.875rem" }}>
          Date
          <Input
            value={form.date}
            type="date"
            onChange={(e) => onChange({ ...form, date: e.target.value })}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.875rem" }}>
          Room
          <select
            value={form.roomId}
            onChange={(e) => onChange({ ...form, roomId: e.target.value })}
            style={selectStyle}
          >
            {data.rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.capacity})
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.875rem" }}>
          Start time
          <Input
            value={form.startTime}
            type="time"
            onChange={(e) => onChange({ ...form, startTime: e.target.value })}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.875rem" }}>
          End time
          <Input
            value={form.endTime}
            type="time"
            onChange={(e) => onChange({ ...form, endTime: e.target.value })}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.875rem" }}>
          Required invigilators
          <Input
            value={form.requiredInvigilators ?? 1}
            type="number"
            min={1}
            onChange={(e) =>
              onChange({
                ...form,
                requiredInvigilators: Math.max(1, Number(e.target.value) || 1),
              })
            }
          />
        </label>
      </div>
      {clashes.length ? (
        <div style={{ marginTop: "1rem" }}>
          <div style={{ fontWeight: 700, color: "var(--eduos-danger)", fontSize: "0.875rem" }}>
            Conflicts to resolve before publishing
          </div>
          <ul style={{ margin: "0.35rem 0 0", paddingLeft: "1.1rem", color: "var(--eduos-text-muted)" }}>
            {clashes.map((c, i) => (
              <li key={`${c.slotId}-${c.otherSlotId}-${i}`}>{c.message}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", marginTop: "1.25rem" }}>
        <Button type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button type="button" onClick={onSubmit}>
          Save
        </Button>
      </div>
    </AdminModal>
  );
}
