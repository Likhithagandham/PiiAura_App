"use client";

import { useMemo, useState } from "react";
import type { AcademicsData, ClassBatchSection } from "@eduos/types";
import { Button, Input } from "@eduos/ui";


function groupByGrade(sections: ClassBatchSection[]): Map<string, ClassBatchSection[]> {
  const map = new Map<string, ClassBatchSection[]>();
  for (const row of sections) {
    const key = row.grade ?? row.label;
    const list = map.get(key) ?? [];
    list.push(row);
    map.set(key, list);
  }
  for (const [, list] of map) {
    list.sort((a, b) => (a.section ?? "").localeCompare(b.section ?? ""));
  }
  return new Map([...map.entries()].sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true })));
}

export function StructureTab({
  data,
  onAction,
  onMessage,
}: {
  data: AcademicsData;
  onAction: (b: Record<string, unknown>) => Promise<unknown>;
  onMessage: (m: string | null) => void;
}) {
  const isSchool = data.institutionType === "school";
  const hierarchyLabel = data.hierarchyLabel ?? "Department";
  const departments = data.departments ?? [];
  const classSections = data.classSections ?? [];

  const [deptName, setDeptName] = useState("");
  const [streamId, setStreamId] = useState(departments[0]?.id ?? "");
  const [gradeInput, setGradeInput] = useState("");
  const [gradePick, setGradePick] = useState("");
  const [sectionInput, setSectionInput] = useState("A");
  const [collegeForm, setCollegeForm] = useState({
    label: "",
    departmentId: departments[0]?.id ?? "",
    batch: "",
    section: "A",
  });

  const sectionsInStream = useMemo(
    () => classSections.filter((c) => c.departmentId === streamId),
    [classSections, streamId],
  );

  const gradesInStream = useMemo(() => {
    const set = new Set<string>();
    for (const c of sectionsInStream) {
      if (c.grade) set.add(c.grade);
    }
    return [...set].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [sectionsInStream]);

  const grouped = useMemo(() => groupByGrade(sectionsInStream), [sectionsInStream]);

  const resolvedGrade = (gradePick || gradeInput).trim();

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <p style={{ fontSize: "0.8125rem", color: "var(--eduos-text-muted)", margin: 0 }}>
        {isSchool
          ? "Stream → grade (Class 1, Class 2, …) → section (A, B, …). Each section is one teachable group for the current academic year."
          : `${hierarchyLabel} hierarchy, then program / batch cohorts.`}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem" }}>
        <div className="eduos-panel">
          <h3 style={{ margin: "0 0 0.75rem", fontSize: "1rem" }}>{hierarchyLabel}s</h3>
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1rem" }}>
            {departments.map((d) => (
              <li
                key={d.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0.5rem 0",
                  borderBottom: "1px solid var(--eduos-border)",
                  fontSize: "0.875rem",
                }}
              >
                <span>{d.name}</span>
                <button
                  type="button"
                  style={{ fontSize: "0.75rem", color: "var(--eduos-danger)", background: "none", border: "none", cursor: "pointer" }}
                  onClick={async () => {
                    const ok = await onAction({ action: "delete_department", departmentId: d.id });
                    if (ok !== null) onMessage(`${hierarchyLabel} removed.`);
                  }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Input label={`New ${hierarchyLabel.toLowerCase()}`} value={deptName} onChange={(e) => setDeptName(e.target.value)} />
            <Button
              type="button"
              style={{ alignSelf: "flex-end" }}
              disabled={!deptName.trim()}
              onClick={async () => {
                await onAction({ action: "save_department", payload: { name: deptName.trim() } });
                onMessage(`${hierarchyLabel} added.`);
                setDeptName("");
              }}
            >
              Add
            </Button>
          </div>
        </div>

        <div className="eduos-panel">
          <h3 style={{ margin: "0 0 0.75rem", fontSize: "1rem" }}>
            {isSchool ? "Grades & sections" : "Programs / batches"}
          </h3>

          <label className="eduos-label" style={{ display: "block", marginBottom: "0.75rem" }}>
            {hierarchyLabel}
            <select
              className="eduos-input"
              value={streamId}
              onChange={(e) => {
                setStreamId(e.target.value);
                setGradePick("");
                setGradeInput("");
              }}
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </label>

          {isSchool ? (
            <>
              {grouped.size === 0 ? (
                <p style={{ fontSize: "0.8125rem", color: "var(--eduos-text-muted)", marginTop: 0 }}>
                  No classes yet. Add a grade and section below.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1rem" }}>
                  {[...grouped.entries()].map(([grade, rows]) => (
                    <div key={grade}>
                      <div style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.35rem" }}>{grade}</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                        {rows.map((row) => (
                          <span
                            key={row.id}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.35rem",
                              padding: "0.25rem 0.5rem",
                              border: "1px solid var(--eduos-border)",
                              borderRadius: "6px",
                              fontSize: "0.8125rem",
                            }}
                          >
                            Section {row.section ?? "—"}
                            <button
                              type="button"
                              title="Remove section"
                              style={{ color: "var(--eduos-danger)", background: "none", border: "none", cursor: "pointer", fontSize: "0.75rem" }}
                              onClick={async () => {
                                const ok = await onAction({ action: "delete_class_section", classSectionId: row.id });
                                if (ok !== null) onMessage(`${row.label} removed.`);
                              }}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: "grid", gap: "0.5rem", borderTop: "1px solid var(--eduos-border)", paddingTop: "0.75rem" }}>
                <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--eduos-text-muted)" }}>Add section</p>
                {gradesInStream.length > 0 ? (
                  <label className="eduos-label">
                    Existing grade
                    <select
                      className="eduos-input"
                      value={gradePick}
                      onChange={(e) => {
                        setGradePick(e.target.value);
                        setGradeInput("");
                      }}
                    >
                      <option value="">— New grade —</option>
                      {gradesInStream.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </label>
                ) : null}
                {!gradePick ? (
                  <Input
                    label="Grade"
                    value={gradeInput}
                    onChange={(e) => setGradeInput(e.target.value)}
                    placeholder="Class 5"
                  />
                ) : null}
                <Input
                  label="Section"
                  value={sectionInput}
                  onChange={(e) => setSectionInput(e.target.value.toUpperCase())}
                  placeholder="A"
                />
                <Button
                  type="button"
                  disabled={!resolvedGrade || !sectionInput.trim()}
                  onClick={async () => {
                    const ok = await onAction({
                      action: "save_class_section",
                      payload: {
                        departmentId: streamId,
                        grade: resolvedGrade,
                        section: sectionInput.trim().toUpperCase() || "A",
                      },
                    });
                    if (ok !== null) {
                      onMessage(`Added ${resolvedGrade} - ${sectionInput.trim().toUpperCase() || "A"}.`);
                      setSectionInput("A");
                      if (!gradePick) setGradeInput("");
                    }
                  }}
                >
                  Add section
                </Button>
              </div>
            </>
          ) : (
            <>
              <table className="eduos-admin-table" style={{ marginBottom: "1rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--eduos-border)", textAlign: "left" }}>
                    <th style={{ padding: "0.35rem" }}>Label</th>
                    <th style={{ padding: "0.35rem" }}>{hierarchyLabel}</th>
                    <th style={{ padding: "0.35rem" }}>Cohort</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {sectionsInStream.map((c) => (
                    <tr key={c.id} style={{ borderBottom: "1px solid var(--eduos-border)" }}>
                      <td style={{ padding: "0.35rem" }}>{c.label}</td>
                      <td style={{ padding: "0.35rem" }}>
                        {departments.find((d) => d.id === c.departmentId)?.name ?? "—"}
                      </td>
                      <td style={{ padding: "0.35rem" }}>{c.batch ?? "—"}</td>
                      <td style={{ padding: "0.35rem" }}>
                        <button
                          type="button"
                          style={{ fontSize: "0.7rem", color: "var(--eduos-danger)", background: "none", border: "none", cursor: "pointer" }}
                          onClick={async () => {
                            const ok = await onAction({ action: "delete_class_section", classSectionId: c.id });
                            if (ok !== null) onMessage("Class removed.");
                          }}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ display: "grid", gap: "0.5rem" }}>
                <Input
                  label="Program / batch label"
                  value={collegeForm.label}
                  onChange={(e) => setCollegeForm({ ...collegeForm, label: e.target.value })}
                  placeholder="BCS III"
                />
                <label className="eduos-label">
                  {hierarchyLabel}
                  <select
                    className="eduos-input"
                    value={collegeForm.departmentId}
                    onChange={(e) => setCollegeForm({ ...collegeForm, departmentId: e.target.value })}
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </label>
                <Input
                  label="Cohort year (optional)"
                  value={collegeForm.batch}
                  onChange={(e) => setCollegeForm({ ...collegeForm, batch: e.target.value })}
                  placeholder="2024"
                />
                <Button
                  type="button"
                  disabled={!collegeForm.label.trim()}
                  onClick={async () => {
                    const ok = await onAction({
                      action: "save_class_section",
                      payload: {
                        departmentId: collegeForm.departmentId,
                        label: collegeForm.label.trim(),
                        batch: collegeForm.batch.trim() || null,
                        section: collegeForm.section || "A",
                      },
                    });
                    if (ok !== null) {
                      onMessage("Program / batch added.");
                      setCollegeForm((f) => ({ ...f, label: "", batch: "" }));
                    }
                  }}
                >
                  Add program / batch
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
