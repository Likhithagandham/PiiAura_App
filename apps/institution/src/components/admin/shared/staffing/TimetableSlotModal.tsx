"use client";

import type { AcademicsData, TimetableSlot } from "@eduos/types";
import { Button } from "@eduos/ui";
import { AdminModal } from "../../AdminModal";
import { applyStaffingFaculty, type TimetableSlotFormState } from "./timetableSlotDefaults";
import { canSaveTimetableSlot, TimetableSlotForm } from "./TimetableSlotForm";

export function TimetableSlotModal({
  data,
  editing,
  form,
  setForm,
  onClose,
  onSave,
  lockClassSectionId,
}: {
  data: AcademicsData;
  editing: TimetableSlot | null;
  form: TimetableSlotFormState;
  setForm: (f: TimetableSlotFormState) => void;
  onClose: () => void;
  onSave: (form: TimetableSlotFormState) => void;
  lockClassSectionId?: string;
}) {
  const canSave = canSaveTimetableSlot(data, form);

  function handleSave() {
    if (!canSave) return;
    onSave(applyStaffingFaculty(data, form));
  }

  return (
    <AdminModal title={editing ? "Edit timetable slot" : "Add timetable slot"} onClose={onClose} wide>
      <TimetableSlotForm
        data={data}
        form={form}
        setForm={setForm}
        lockClassSectionId={lockClassSectionId}
        editingFacultyUserId={editing?.facultyUserId}
      />
      <div style={{ marginTop: "1rem", display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="button" onClick={handleSave} disabled={!canSave}>
          Save slot
        </Button>
      </div>
    </AdminModal>
  );
}
