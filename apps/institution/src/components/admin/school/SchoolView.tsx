"use client";

import { useMemo, useState } from "react";
import { useApiData } from "@/lib/queries";
import type {
  ClassBatchSection,
  ClassTeacherAssignment,
  DailyHomeworkEntry,
  HomeworkStatus,
  SaveHomeworkInput,
  SchoolOnlyData,
} from "@eduos/types";
import { ADMIN_SCOPED_NAV } from "@eduos/constants";
import { Button, Input, InlineLoading } from "@eduos/ui";
import { StaffingSummaryLink } from "../shared/staffing";
import { AdminShell } from "../AdminShell";
import { AdminModal } from "../AdminModal";
import { AdminTabs, AdminMessage } from "../ui";
import { useGradeSectionFilters } from "./useGradeSectionFilters";

const smallBtnStyle: React.CSSProperties = { width: "auto", padding: "0.5rem 0.75rem", fontSize: "0.875rem" };

const tabs = ["Class teacher", "Homework"] as const;
type Tab = (typeof tabs)[number];

type HomeworkStatusFilter = "all" | HomeworkStatus;

function idemHeaders(): HeadersInit {
  return { "Content-Type": "application/json", "Idempotency-Key": `school-${Date.now()}` };
}

function selectStyle(): React.CSSProperties {
  return {
    width: "100%",
    padding: "0.5rem 0.75rem",
    borderRadius: "var(--eduos-radius)",
    border: "1px solid var(--eduos-border)",
    background: "var(--eduos-card)",
    fontSize: "0.875rem",
  };
}

const filterSelectStyle: React.CSSProperties = { minWidth: "8rem" };

function GradeSectionFilters({
  gradeKey,
  gradeOptions,
  sectionsForGrade,
  sectionId,
  onGradeChange,
  onSectionChange,
  extra,
}: {
  gradeKey: string;
  gradeOptions: { key: string; label: string }[];
  sectionsForGrade: ClassBatchSection[];
  sectionId: string;
  onGradeChange: (key: string) => void;
  onSectionChange: (id: string) => void;
  extra?: React.ReactNode;
}) {
  if (!gradeOptions.length) return null;
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.75rem",
        alignItems: "center",
        marginBottom: "1rem",
      }}
    >
      <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem" }}>
        <span style={{ fontWeight: 600, color: "var(--eduos-text-muted)" }}>Grade</span>
        <select
          value={gradeKey}
          onChange={(e) => onGradeChange(e.target.value)}
          className="eduos-input"
          style={filterSelectStyle}
        >
          {gradeOptions.map((g) => (
            <option key={g.key} value={g.key}>
              {g.label}
            </option>
          ))}
        </select>
      </label>
      {sectionsForGrade.length > 0 ? (
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem" }}>
          <span style={{ fontWeight: 600, color: "var(--eduos-text-muted)" }}>Section</span>
          <select
            value={sectionId}
            onChange={(e) => onSectionChange(e.target.value)}
            className="eduos-input"
            style={{ minWidth: "5rem" }}
          >
            {sectionsForGrade.map((c) => (
              <option key={c.id} value={c.id}>
                {c.section ?? c.label.split(" - ").pop() ?? c.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {extra}
    </div>
  );
}

export function SchoolView() {
  const { data, error: queryError, refetch } = useApiData<SchoolOnlyData>("/api/admin/school");
  const load = refetch;
  const loadError = queryError
    ? queryError instanceof Error
      ? queryError.message
      : "Could not load school module."
    : null;
  const [tab, setTab] = useState<Tab>("Class teacher");
  const [message, setMessage] = useState<string | null>(null);

  const [hwModal, setHwModal] = useState<null | SaveHomeworkInput>(null);

  async function patchAction(body: Record<string, unknown>) {
    setMessage(null);
    const res = await fetch("/api/admin/school/actions", {
      method: "PATCH",
      credentials: "include",
      headers: idemHeaders(),
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage((json as { error?: string }).error ?? "Request failed");
      return null;
    }
    await load();
    return json;
  }

  const classSections = data?.classSections ?? [];
  const facultyOptions = data?.facultyOptions ?? [];
  const sectionFilters = useGradeSectionFilters(classSections);
  const { sectionId, selectedSection } = sectionFilters;
  const [hwStatusFilter, setHwStatusFilter] = useState<HomeworkStatusFilter>("all");

  const classTeacherByClass = useMemo(() => {
    const map = new Map<string, ClassTeacherAssignment>();
    (data?.classTeachers ?? []).forEach((a) => map.set(a.classSectionId, a));
    return map;
  }, [data?.classTeachers]);

  const filteredClassTeachers = useMemo(() => {
    const rows = Array.from(classTeacherByClass.values());
    if (!sectionId) return rows;
    return rows.filter((a) => a.classSectionId === sectionId);
  }, [classTeacherByClass, sectionId]);

  const homework = useMemo(
    () => (data?.homework ?? []).slice().sort((a, b) => b.date.localeCompare(a.date)),
    [data?.homework],
  );

  const filteredHomework = useMemo(() => {
    let rows = homework;
    if (sectionId) rows = rows.filter((h) => h.classSectionId === sectionId);
    if (hwStatusFilter !== "all") rows = rows.filter((h) => h.status === hwStatusFilter);
    return rows;
  }, [homework, sectionId, hwStatusFilter]);

  const defaultClassId = sectionId || (classSections[0]?.id ?? "");

  function openNewHomeworkModal() {
    setHwModal({
      classSectionId: defaultClassId,
      date: new Date().toISOString().slice(0, 10),
      title: "",
      details: "",
      publish: false,
    });
  }

  function openEditHomeworkModal(h: DailyHomeworkEntry) {
    setHwModal({
      id: h.id,
      classSectionId: h.classSectionId,
      date: h.date,
      title: h.title,
      details: h.details,
      publish: h.status === "published",
    });
  }

  return (
    <AdminShell title={ADMIN_SCOPED_NAV.school.label}>
      {loadError ? <p style={{ color: "var(--eduos-danger)" }}>{loadError}</p> : null}
      <AdminMessage>{message}</AdminMessage>

      {!data ? (
        <section className="eduos-panel">
          {loadError ? (
            <p style={{ color: "var(--eduos-danger)" }}>{loadError}</p>
          ) : (
            <InlineLoading />
          )}
        </section>
      ) : (
        <>
          <AdminTabs tabs={tabs.map((t) => ({ id: t, label: t }))} active={tab} onChange={setTab} />
          <section className="eduos-panel">
            <div className="eduos-admin-toolbar">
              <Button type="button" variant="secondary" onClick={() => load()} style={smallBtnStyle}>
                Refresh
              </Button>
              {tab === "Homework" ? (
                <Button
                  type="button"
                  onClick={openNewHomeworkModal}
                  style={smallBtnStyle}
                  disabled={!classSections.length}
                >
                  New homework
                </Button>
              ) : null}
            </div>
          </section>

          {tab === "Class teacher" ? (
            <section className="eduos-panel">
              <h2 className="eduos-section-title">Class teacher assignment</h2>
              <p style={{ fontSize: "0.875rem", color: "var(--eduos-text-muted)", marginTop: 0 }}>
                Assign or change class teachers in Academics → Staffing.{" "}
                <StaffingSummaryLink sectionId={sectionId || undefined} />
              </p>
              <GradeSectionFilters
                {...sectionFilters}
                onGradeChange={sectionFilters.setGradeKey}
                onSectionChange={sectionFilters.setSectionId}
              />
              <table className="eduos-admin-table" style={{ marginTop: "0.75rem" }}>
                <thead>
                  <tr>
                    <th>Class</th>
                    <th>Teacher</th>
                    <th>Assigned</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClassTeachers.length === 0 ? (
                    <tr>
                      <td colSpan={3} style={{ color: "var(--eduos-text-muted)" }}>
                        {sectionId && selectedSection
                          ? `No class teacher assigned for ${selectedSection.label}.`
                          : "No assignments yet."}
                      </td>
                    </tr>
                  ) : (
                    filteredClassTeachers.map((a) => (
                      <tr key={a.classSectionId}>
                        <td>{a.classLabel}</td>
                        <td>{a.teacherName}</td>
                        <td>{new Date(a.assignedAt).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </section>
          ) : null}

          {tab === "Homework" ? (
            <section className="eduos-panel">
              <h2 className="eduos-section-title">Daily homework / diary</h2>
              <GradeSectionFilters
                {...sectionFilters}
                onGradeChange={sectionFilters.setGradeKey}
                onSectionChange={sectionFilters.setSectionId}
                extra={
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem" }}>
                    <span style={{ fontWeight: 600, color: "var(--eduos-text-muted)" }}>Status</span>
                    <select
                      value={hwStatusFilter}
                      onChange={(e) => setHwStatusFilter(e.target.value as HomeworkStatusFilter)}
                      className="eduos-input"
                      style={{ minWidth: "7rem" }}
                    >
                      <option value="all">All</option>
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </label>
                }
              />
              <table className="eduos-admin-table" style={{ marginTop: "0.75rem" }}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Class</th>
                    <th>Title</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {filteredHomework.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ color: "var(--eduos-text-muted)" }}>
                        {sectionId && selectedSection
                          ? `No homework for ${selectedSection.label}${hwStatusFilter !== "all" ? ` (${hwStatusFilter})` : ""}.`
                          : "No homework entries."}
                      </td>
                    </tr>
                  ) : (
                    filteredHomework.map((h: DailyHomeworkEntry) => (
                      <tr key={h.id}>
                        <td>{h.date}</td>
                        <td>{h.classLabel}</td>
                        <td>{h.title}</td>
                        <td>{h.status}</td>
                        <td>
                          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                            <Button
                              type="button"
                              variant="secondary"
                              style={smallBtnStyle}
                              onClick={() => openEditHomeworkModal(h)}
                            >
                              Edit
                            </Button>
                            <Button
                              type="button"
                              variant="secondary"
                              style={smallBtnStyle}
                              onClick={async () => {
                                if (!window.confirm(`Delete homework "${h.title}"?`)) return;
                                await patchAction({
                                  action: "delete_homework",
                                  payload: { id: h.id },
                                });
                                setMessage("Deleted.");
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </section>
          ) : null}

          {hwModal ? (
            <AdminModal title={hwModal.id ? "Edit homework" : "New homework"} onClose={() => setHwModal(null)} wide>
              <label className="eduos-label">Class</label>
              <select
                className="eduos-input"
                style={selectStyle()}
                value={hwModal.classSectionId}
                onChange={(e) => setHwModal((p) => (p ? { ...p, classSectionId: e.target.value } : p))}
              >
                {classSections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
              <div style={{ height: "0.75rem" }} />
              <Input label="Date" value={hwModal.date} onChange={(e) => setHwModal((p) => (p ? { ...p, date: e.target.value } : p))} />
              <div style={{ height: "0.75rem" }} />
              <Input label="Title" value={hwModal.title} onChange={(e) => setHwModal((p) => (p ? { ...p, title: e.target.value } : p))} />
              <div style={{ height: "0.75rem" }} />
              <label className="eduos-label">Details</label>
              <textarea
                className="eduos-input"
                rows={4}
                value={hwModal.details}
                onChange={(e) => setHwModal((p) => (p ? { ...p, details: e.target.value } : p))}
                style={{ resize: "vertical" }}
              />
              <div style={{ marginTop: "0.75rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem" }}>
                  <input
                    type="checkbox"
                    checked={!!hwModal.publish}
                    onChange={(e) => setHwModal((p) => (p ? { ...p, publish: e.target.checked } : p))}
                  />
                  Publish
                </label>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1rem" }}>
                <Button type="button" variant="secondary" onClick={() => setHwModal(null)} style={smallBtnStyle}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={async () => {
                    const p = hwModal;
                    if (!p?.classSectionId || !p.title.trim()) return;
                    await patchAction({ action: "save_homework", payload: p });
                    setHwModal(null);
                    setMessage(p.publish ? "Published." : "Saved.");
                  }}
                  style={smallBtnStyle}
                  disabled={!hwModal.classSectionId || !hwModal.title.trim()}
                >
                  Save
                </Button>
              </div>
            </AdminModal>
          ) : null}
        </>
      )}
    </AdminShell>
  );
}
