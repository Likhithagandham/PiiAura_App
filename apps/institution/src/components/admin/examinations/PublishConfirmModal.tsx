import type { ResultPublishConfirmation } from "@eduos/types";
import { Button, Input } from "@eduos/ui";
import { AdminModal } from "../AdminModal";

export function PublishConfirmModal({
  preview,
  note,
  onNoteChange,
  onClose,
  onConfirm,
}: {
  preview: ResultPublishConfirmation | null;
  note: string;
  onNoteChange: (v: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <AdminModal title="Confirm publish (step 2)" onClose={onClose}>
      {preview ? (
        <div style={{ fontSize: "0.875rem", marginBottom: "0.75rem" }}>
          {preview.summary.examName ? (
            <div style={{ marginBottom: "0.35rem" }}>
              Exam: <strong>{preview.summary.examName}</strong>
            </div>
          ) : null}
          <div>
            Students: <strong>{preview.summary.totalStudents}</strong> · Absent:{" "}
            <strong>{preview.summary.absentCount}</strong>
          </div>
          <div>
            Average: <strong>{preview.summary.averagePercent}%</strong>
          </div>
          <p style={{ margin: "0.5rem 0 0", fontSize: "0.8125rem", color: "var(--eduos-text-muted)" }}>
            This publishes results for all classes and subjects in this exam.
          </p>
        </div>
      ) : null}
      <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "1rem" }}>
        Publish note
        <Input value={note} onChange={(e) => onNoteChange(e.target.value)} style={{ marginTop: "0.35rem" }} />
      </label>
      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
        <Button type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button type="button" onClick={onConfirm}>
          Publish
        </Button>
      </div>
    </AdminModal>
  );
}
