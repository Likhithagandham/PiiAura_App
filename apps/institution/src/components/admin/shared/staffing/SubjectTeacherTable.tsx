"use client";

import type { FacultyOption, SubjectMaster } from "@eduos/types";
import { Button, EmptyState } from "@eduos/ui";
import Link from "next/link";
import { useState } from "react";
import { AdminModal } from "../../AdminModal";
import { FacultySelect } from "./FacultySelect";

export function SubjectTeacherTable({
  subjects,
  facultyName,
  getAssignment,
  faculty,
  onAssign,
  onUnassign,
}: {
  subjects: SubjectMaster[];
  facultyName: (userId: string) => string;
  getAssignment: (subjectId: string) => string | null;
  faculty: FacultyOption[];
  onAssign: (subjectId: string, facultyUserId: string) => Promise<void>;
  onUnassign: (subjectId: string) => Promise<void>;
}) {
  const [modal, setModal] = useState<{ subjectId: string; subjectName: string; facultyUserId: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!modal?.facultyUserId) return;
    setBusy(true);
    try {
      await onAssign(modal.subjectId, modal.facultyUserId);
      setModal(null);
    } finally {
      setBusy(false);
    }
  }

  if (subjects.length === 0) {
    return (
      <EmptyState
        compact
        title="No subjects for this program"
        description="Subjects are defined per grade or program. Add them under Academics → Subjects, then return here to assign teachers."
        action={
          <Link href="/admin/academics?tab=Subjects" className="eduos-link">
            Go to Subjects tab
          </Link>
        }
      />
    );
  }

  return (
    <>
      <div className="eduos-table-wrap">
        <table className="eduos-admin-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Code</th>
              <th>Teacher</th>
              <th className="eduos-admin-table__nowrap">Status</th>
              <th className="eduos-admin-table__nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((subject) => {
              const facultyUserId = getAssignment(subject.id);
              const unassigned = !facultyUserId;
              return (
                <tr key={subject.id}>
                  <td className="portal-table-emphasis">{subject.name}</td>
                  <td className="eduos-admin-table__nowrap">
                    <code>{subject.code}</code>
                  </td>
                  <td>{facultyUserId ? facultyName(facultyUserId) : "—"}</td>
                  <td className="eduos-admin-table__nowrap">
                    <span
                      className={`staffing-status-badge${unassigned ? " staffing-status-badge--warning" : " staffing-status-badge--ok"}`}
                    >
                      {unassigned ? "Unassigned" : "Assigned"}
                    </span>
                  </td>
                  <td className="eduos-admin-table__nowrap">
                    <div className="staffing-row-actions">
                      <Button
                        type="button"
                        variant="secondary"
                        className="eduos-admin-btn-sm"
                        onClick={() =>
                          setModal({
                            subjectId: subject.id,
                            subjectName: subject.name,
                            facultyUserId: facultyUserId ?? "",
                          })
                        }
                      >
                        {facultyUserId ? "Change" : "Assign"}
                      </Button>
                      {facultyUserId ? (
                        <Button
                          type="button"
                          variant="secondary"
                          className="eduos-admin-btn-sm"
                          onClick={() => void onUnassign(subject.id)}
                        >
                          Clear
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {modal ? (
        <AdminModal title={`Assign teacher — ${modal.subjectName}`} onClose={() => setModal(null)}>
          <FacultySelect
            faculty={faculty}
            value={modal.facultyUserId}
            onChange={(id) => setModal({ ...modal, facultyUserId: id })}
          />
          <div className="staffing-modal-actions">
            <Button type="button" variant="secondary" onClick={() => setModal(null)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void save()} disabled={!modal.facultyUserId || busy}>
              Save
            </Button>
          </div>
        </AdminModal>
      ) : null}
    </>
  );
}
