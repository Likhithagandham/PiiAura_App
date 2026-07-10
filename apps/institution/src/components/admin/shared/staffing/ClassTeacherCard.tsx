"use client";

import type { ClassTeacherAssignment, FacultyOption } from "@eduos/types";
import { Button } from "@eduos/ui";
import { AdminModal } from "../../AdminModal";
import { FacultySelect } from "./FacultySelect";
import { useState } from "react";

export function ClassTeacherCard({
  sectionLabel,
  assignment,
  faculty,
  onAssign,
  onUnassign,
}: {
  sectionLabel: string;
  assignment: ClassTeacherAssignment | null;
  faculty: FacultyOption[];
  onAssign: (teacherUserId: string) => Promise<void>;
  onUnassign: () => Promise<void>;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [teacherUserId, setTeacherUserId] = useState(assignment?.teacherUserId ?? "");
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!teacherUserId) return;
    setBusy(true);
    try {
      await onAssign(teacherUserId);
      setModalOpen(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="eduos-panel staffing-class-teacher">
      <div className="staffing-panel-head">
        <div>
          <h2 className="eduos-section-title">Class teacher</h2>
          <p className="eduos-section-desc">Homeroom teacher for {sectionLabel}.</p>
        </div>
        <span
          className={`staffing-status-badge${assignment ? " staffing-status-badge--ok" : " staffing-status-badge--warning"}`}
        >
          {assignment ? "Assigned" : "Unassigned"}
        </span>
      </div>
      <div className="staffing-class-teacher__body">
        <div>
          <div className="staffing-class-teacher__name">{sectionLabel}</div>
          <div className="staffing-class-teacher__meta">
            {assignment ? assignment.teacherName : "No class teacher assigned yet"}
          </div>
        </div>
        <div className="staffing-row-actions">
          <Button
            type="button"
            variant="secondary"
            className="eduos-admin-btn-sm"
            onClick={() => {
              setTeacherUserId(assignment?.teacherUserId ?? "");
              setModalOpen(true);
            }}
          >
            {assignment ? "Change" : "Assign"}
          </Button>
          {assignment ? (
            <Button type="button" variant="secondary" className="eduos-admin-btn-sm" onClick={() => void onUnassign()}>
              Unassign
            </Button>
          ) : null}
        </div>
      </div>
      {modalOpen ? (
        <AdminModal title="Assign class teacher" onClose={() => setModalOpen(false)}>
          <FacultySelect faculty={faculty} value={teacherUserId} onChange={setTeacherUserId} />
          <div className="staffing-modal-actions">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void save()} disabled={!teacherUserId || busy}>
              Save
            </Button>
          </div>
        </AdminModal>
      ) : null}
    </section>
  );
}
