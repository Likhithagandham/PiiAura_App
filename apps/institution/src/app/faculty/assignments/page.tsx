"use client";

import type {
  CreateFacultyAssignmentInput,
  FacultyAssignment,
  FacultyAssignmentsData,
  FacultyAssignmentSubmission,
} from "@eduos/types";
import { useMemo, useState } from "react";
import { FacultyShell } from "@/components/faculty/FacultyShell";
import { useApiData } from "@/lib/queries";
import { Button, Input, InlineLoading, PortalFilterBar, filterBySearch } from "@eduos/ui";

const cardStyle: React.CSSProperties = {
  background: "var(--eduos-card)",
  border: "1px solid var(--eduos-border)",
  borderRadius: "var(--eduos-radius-lg)",
  padding: "1.25rem",
};

const tableStyle: React.CSSProperties = { width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" };
const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "0.5rem 0.75rem",
  borderBottom: "1px solid var(--eduos-border)",
  color: "var(--eduos-text-muted)",
  fontWeight: 700,
};
const tdStyle: React.CSSProperties = { padding: "0.5rem 0.75rem", borderBottom: "1px solid var(--eduos-border)" };

function badge(status: FacultyAssignmentSubmission["similarityStatus"]) {
  if (status === "high") return { bg: "#fef2f2", color: "#b91c1c", border: "#fecaca" };
  if (status === "warning") return { bg: "#fffbeb", color: "#b45309", border: "#fde68a" };
  return { bg: "#ecfdf5", color: "#047857", border: "#a7f3d0" };
}

function AssignmentList({
  title,
  subtitle,
  assignments,
  selectedId,
  facultyUserId,
  onSelect,
}: {
  title: string;
  subtitle: string;
  assignments: FacultyAssignment[];
  selectedId: string;
  facultyUserId?: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div style={{ marginTop: "0.75rem" }}>
      <h3 style={{ margin: 0, fontSize: "0.875rem", fontWeight: 800 }}>{title}</h3>
      <p style={{ margin: "0.25rem 0 0.5rem", fontSize: "0.75rem", color: "var(--eduos-text-muted)" }}>{subtitle}</p>
      {assignments.length === 0 ? (
        <p style={{ color: "var(--eduos-text-muted)", fontSize: "0.8125rem", margin: 0 }}>None yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {assignments.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => onSelect(a.id)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  border: "1px solid var(--eduos-border)",
                  background: a.id === selectedId ? "var(--eduos-primary-light)" : "transparent",
                  color: a.id === selectedId ? "var(--eduos-primary)" : "var(--eduos-text)",
                  borderRadius: "var(--eduos-radius)",
                  padding: "0.75rem",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontWeight: 800 }}>
                  {a.title}
                  {facultyUserId && a.createdByUserId === facultyUserId ? (
                    <span
                      style={{
                        marginLeft: "0.5rem",
                        fontSize: "0.6875rem",
                        fontWeight: 700,
                        color: "var(--eduos-primary)",
                      }}
                    >
                      You
                    </span>
                  ) : null}
                </div>
                <div style={{ color: "var(--eduos-text-muted)", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                  {a.classLabel} · {a.subjectName} · Due {new Date(a.dueAt).toLocaleString()}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function FacultyAssignmentsPage() {
  const { data, error: queryError, refetch } = useApiData<FacultyAssignmentsData>(
    "/api/faculty/assignments",
  );
  const load = refetch;
  const error = queryError ? "Failed to load assignments." : null;
  const [message, setMessage] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [create, setCreate] = useState<CreateFacultyAssignmentInput>({
    title: "New assignment",
    description: "",
    classSectionId: "",
    subjectId: "",
    dueAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  });

  // Default selection derives from the loaded data; a non-null override means the
  // faculty clicked an assignment (avoids setState-in-effect on load).
  const [selectedOverride, setSelectedOverride] = useState<string | null>(null);
  const [assignmentSearch, setAssignmentSearch] = useState("");

  const facultyUserId = data?.facultyUserId ?? "";

  const myClassAssignments = useMemo(() => {
    const ownIds = new Set((data?.otherClasses.assignments ?? []).map((a) => a.id));
    return (data?.myClass.assignments ?? []).filter((a) => !ownIds.has(a.id));
  }, [data]);

  const filteredMyClassAssignments = useMemo(
    () => filterBySearch(myClassAssignments, assignmentSearch, (a) => [a.title, a.description, a.classSectionId]),
    [myClassAssignments, assignmentSearch],
  );

  const filteredTeachingAssignments = useMemo(
    () =>
      filterBySearch(data?.otherClasses.assignments ?? [], assignmentSearch, (a) => [
        a.title,
        a.description,
        a.classSectionId,
      ]),
    [data?.otherClasses.assignments, assignmentSearch],
  );

  const allAssignments = useMemo(
    () => [...myClassAssignments, ...(data?.otherClasses.assignments ?? [])],
    [data, myClassAssignments],
  );

  const selectedAssignmentId = selectedOverride ?? allAssignments[0]?.id ?? "";

  const selected = useMemo(
    () => allAssignments.find((a) => a.id === selectedAssignmentId) ?? null,
    [allAssignments, selectedAssignmentId],
  );

  const submissions = useMemo(
    () => (data?.submissions ?? []).filter((s) => s.assignmentId === selectedAssignmentId),
    [data?.submissions, selectedAssignmentId],
  );

  const teachingClasses = data?.otherClasses.teachingClasses ?? [];
  // Class/subject default to the first teaching class until the faculty picks one.
  const effectiveClassSectionId = create.classSectionId || teachingClasses[0]?.classSectionId || "";
  const selectedTeachingClass = teachingClasses.find(
    (c) => c.classSectionId === effectiveClassSectionId,
  );
  const subjectOptions = selectedTeachingClass?.subjects ?? [];
  const effectiveSubjectId = create.subjectId || subjectOptions[0]?.id || "";

  async function createAssignment() {
    setMessage(null);
    const res = await fetch("/api/faculty/assignments", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...create,
        classSectionId: effectiveClassSectionId,
        subjectId: effectiveSubjectId,
      }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage((json as { error?: string }).error ?? "Create failed");
      return;
    }
    setMessage("Assignment created.");
    setShowForm(false);
    await load();
  }

  return (
    <FacultyShell title="Assignments">
      {error ? <p style={{ color: "var(--eduos-danger)" }}>{error}</p> : null}
      {message ? <p style={{ color: "var(--eduos-primary)" }}>{message}</p> : null}

      {data ? (
        <PortalFilterBar
          search={assignmentSearch}
          onSearchChange={setAssignmentSearch}
          searchPlaceholder="Search assignment title or description…"
          total={allAssignments.length}
          filtered={filteredMyClassAssignments.length + filteredTeachingAssignments.length}
        />
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "1rem" }}>
        <section style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 800 }}>My class</h2>
              <p style={{ margin: "0.35rem 0 0", fontSize: "0.8125rem", color: "var(--eduos-text-muted)" }}>
                View all assignments for your homeroom
                {data?.myClass.homerooms[0]?.classLabel
                  ? ` (${data.myClass.homerooms.map((h) => h.classLabel).join(", ")})`
                  : ""}
                . Assignments you create appear under Classes I teach.
              </p>
            </div>
            <Button type="button" variant="secondary" onClick={() => void load()}>
              Refresh
            </Button>
          </div>
          {!data ? (
            <InlineLoading size="sm" minHeight="4rem" />
          ) : data.myClass.homerooms.length === 0 ? (
            <p style={{ color: "var(--eduos-text-muted)", marginTop: "0.75rem" }}>
              You are not assigned as a class teacher.
            </p>
          ) : (
            <AssignmentList
              title="Homeroom assignments"
              subtitle="Work posted by subject teachers for your class (not including your own posts)."
              assignments={filteredMyClassAssignments}
              selectedId={selectedAssignmentId}
              facultyUserId={facultyUserId}
              onSelect={setSelectedOverride}
            />
          )}
        </section>

        <section style={cardStyle}>
          <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 800 }}>Submissions</h2>
          <p style={{ margin: "0.35rem 0 0", fontSize: "0.8125rem", color: "var(--eduos-text-muted)" }}>
            Select an assignment from either section to review student work.
          </p>
          {!selected ? (
            <p style={{ color: "var(--eduos-text-muted)", marginTop: "0.75rem" }}>Select an assignment.</p>
          ) : submissions.length === 0 ? (
            <p style={{ color: "var(--eduos-text-muted)", marginTop: "0.75rem" }}>No submissions yet.</p>
          ) : (
            <table style={{ ...tableStyle, marginTop: "0.75rem" }}>
              <thead>
                <tr>
                  <th style={thStyle}>Student</th>
                  <th style={thStyle}>Submitted</th>
                  <th style={thStyle}>Similarity</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((s: FacultyAssignmentSubmission) => (
                  <tr key={s.id}>
                    <td style={tdStyle}>{s.studentName}</td>
                    <td style={tdStyle}>{new Date(s.submittedAt).toLocaleString()}</td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "0.2rem 0.5rem",
                          borderRadius: 999,
                          border: `1px solid ${badge(s.similarityStatus).border}`,
                          background: badge(s.similarityStatus).bg,
                          color: badge(s.similarityStatus).color,
                          fontWeight: 800,
                          fontSize: "0.75rem",
                        }}
                      >
                        {s.similarityPercent}% · {s.similarityStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>

      <section style={{ ...cardStyle, marginTop: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 800 }}>Classes I teach</h2>
            <p style={{ margin: "0.35rem 0 0", fontSize: "0.8125rem", color: "var(--eduos-text-muted)" }}>
              Create and manage assignments for your subject-teaching classes.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            disabled={teachingClasses.length === 0}
          >
            {showForm ? "Cancel" : "Create assignment"}
          </Button>
        </div>

        {teachingClasses.length === 0 ? (
          <p style={{ marginTop: "0.75rem", color: "var(--eduos-text-muted)" }}>
            No subject teaching assignments yet. Contact admin via Staffing.
          </p>
        ) : showForm ? (
          <div style={{ marginTop: "0.75rem" }}>
            <p style={{ margin: "0 0 0.75rem", fontSize: "0.75rem", color: "var(--eduos-text-muted)" }}>
              Pick the class and subject you teach. If you also teach in your homeroom class, it will appear here too.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: "0.75rem" }}>
              <Input label="Title" value={create.title} onChange={(e) => setCreate((p) => ({ ...p, title: e.target.value }))} />
              <label style={{ fontSize: "0.8125rem" }}>
                Class
                <select
                  className="eduos-input"
                  value={effectiveClassSectionId}
                  onChange={(e) => {
                    const classSectionId = e.target.value;
                    const tc = teachingClasses.find((c) => c.classSectionId === classSectionId);
                    setCreate((p) => ({
                      ...p,
                      classSectionId,
                      subjectId: tc?.subjects[0]?.id ?? "",
                    }));
                  }}
                  style={{ display: "block", marginTop: "0.25rem", width: "100%" }}
                >
                  {teachingClasses.map((c) => (
                    <option key={c.classSectionId} value={c.classSectionId}>
                      {c.classLabel}
                    </option>
                  ))}
                </select>
              </label>
              <label style={{ fontSize: "0.8125rem" }}>
                Subject
                <select
                  className="eduos-input"
                  value={effectiveSubjectId}
                  onChange={(e) => setCreate((p) => ({ ...p, subjectId: e.target.value }))}
                  style={{ display: "block", marginTop: "0.25rem", width: "100%" }}
                >
                  {subjectOptions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div style={{ marginTop: "0.75rem" }}>
              <textarea
                className="eduos-input"
                rows={3}
                placeholder="Description"
                value={create.description}
                onChange={(e) => setCreate((p) => ({ ...p, description: e.target.value }))}
              />
            </div>
            <div style={{ marginTop: "0.75rem" }}>
              <Button type="button" onClick={createAssignment}>
                Save assignment
              </Button>
            </div>
          </div>
        ) : null}

        <AssignmentList
          title="Assignments you posted"
          subtitle="Assignments you created as a subject teacher."
          assignments={filteredTeachingAssignments}
          selectedId={selectedAssignmentId}
          facultyUserId={facultyUserId}
          onSelect={setSelectedOverride}
        />
      </section>
    </FacultyShell>
  );
}
