"use client";

import type { DailyHomeworkEntry, FacultyHomeworkData, FacultySaveHomeworkInput } from "@eduos/types";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { FacultyShell } from "@/components/faculty/FacultyShell";
import { FacultyHomeworkTable, smallBtnStyle } from "@/components/faculty/FacultyHomeworkTable";
import { useFacultyScope } from "@/components/faculty/FacultyScopeContext";
import { Button, Input, InlineLoading, PortalFilterBar, filterBySearch } from "@eduos/ui";
import { deleteHomeworkAction, loadHomeworkAction, saveHomeworkAction } from "./actions";

const cardStyle: React.CSSProperties = {
  background: "var(--eduos-card)",
  border: "1px solid var(--eduos-border)",
  borderRadius: "var(--eduos-radius-lg)",
  padding: "1.25rem",
};

export default function FacultyHomeworkPage() {
  const { institutionType, settingsReady } = useFacultyScope();
  const [pending, startTransition] = useTransition();
  const [data, setData] = useState<FacultyHomeworkData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [homeworkSearch, setHomeworkSearch] = useState("");
  const [form, setForm] = useState<FacultySaveHomeworkInput>({
    classSectionId: "",
    date: new Date().toISOString().slice(0, 10),
    title: "",
    details: "",
    publish: false,
  });

  const load = useCallback(() => {
    if (institutionType !== "school") return;
    setError(null);
    startTransition(async () => {
      const result = await loadHomeworkAction(institutionType);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setData(result.data);
      const teaching = result.data.otherClasses.teachingClasses;
      setForm((f) =>
        f.classSectionId
          ? f
          : { ...f, classSectionId: teaching[0]?.classSectionId ?? "" },
      );
    });
  }, [institutionType]);

  useEffect(() => {
    if (!settingsReady || institutionType !== "school") return;
    const id = window.setTimeout(() => load(), 0);
    return () => window.clearTimeout(id);
  }, [settingsReady, institutionType, load]);

  const teachingClasses = data?.otherClasses.teachingClasses ?? [];
  const facultyUserId = data?.facultyUserId ?? "";

  const myClassHomework = useMemo(() => {
    const ownIds = new Set((data?.otherClasses.homework ?? []).map((h) => h.id));
    return (data?.myClass.homework ?? []).filter((h) => !ownIds.has(h.id));
  }, [data]);

  const filteredTeachingHomework = useMemo(
    () =>
      filterBySearch(data?.otherClasses.homework ?? [], homeworkSearch, (h) => [
        h.title,
        h.details,
        h.classSectionId,
      ]),
    [data?.otherClasses.homework, homeworkSearch],
  );

  if (!settingsReady) {
    return (
      <FacultyShell title="Homework / diary">
        <InlineLoading />
      </FacultyShell>
    );
  }

  if (institutionType !== "school") {
    return (
      <FacultyShell title="Homework / diary">
        <section style={cardStyle}>
          <p style={{ margin: 0, color: "var(--eduos-text-muted)" }}>
            Daily homework / diary is a school-only feature. Switch to <strong>School</strong> in the header
            toggle to use it.
          </p>
        </section>
      </FacultyShell>
    );
  }

  function save(publish: boolean) {
    if (institutionType !== "school") return;
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await saveHomeworkAction({ ...form, publish }, "school");
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMessage(publish ? "Homework published." : "Homework saved as draft.");
      setShowForm(false);
      setForm((f) => ({ ...f, title: "", details: "", publish: false }));
      load();
    });
  }

  function publishEntry(h: DailyHomeworkEntry) {
    if (institutionType !== "school") return;
    startTransition(async () => {
      const result = await saveHomeworkAction(
        {
          id: h.id,
          classSectionId: h.classSectionId,
          date: h.date,
          title: h.title,
          details: h.details,
          publish: true,
        },
        institutionType,
      );
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMessage("Homework published.");
      load();
    });
  }

  function deleteEntry(h: DailyHomeworkEntry) {
    if (!window.confirm(`Delete homework "${h.title}"?`)) return;
    startTransition(async () => {
      const result = await deleteHomeworkAction(h.id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMessage("Homework deleted.");
      load();
    });
  }

  return (
    <FacultyShell title="Homework / diary">
      {error ? <p style={{ color: "var(--eduos-danger)" }}>{error}</p> : null}
      {message ? <p style={{ color: "var(--eduos-primary)" }}>{message}</p> : null}

      <section style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 800 }}>My class</h2>
            <p style={{ margin: "0.35rem 0 0", fontSize: "0.8125rem", color: "var(--eduos-text-muted)" }}>
              View all homework for your homeroom
              {data?.myClass.homerooms[0]?.classLabel
                ? ` (${data.myClass.homerooms.map((h) => h.classLabel).join(", ")})`
                : ""}
              . Homework you post appears under Classes I teach.
            </p>
          </div>
          <Button type="button" variant="secondary" onClick={load} disabled={pending} style={smallBtnStyle}>
            Refresh
          </Button>
        </div>

        {!data ? (
          <InlineLoading size="sm" minHeight="4rem" />
        ) : data.myClass.homerooms.length === 0 ? (
          <p style={{ marginTop: "0.75rem", color: "var(--eduos-text-muted)" }}>
            You are not assigned as a class teacher.
          </p>
        ) : (
          <FacultyHomeworkTable
            rows={myClassHomework}
            canManageAll
            currentUserId={facultyUserId}
            pending={pending}
            onPublish={publishEntry}
            onDelete={deleteEntry}
            emptyMessage="No homework from other teachers for your class yet."
          />
        )}
      </section>

      <section style={{ ...cardStyle, marginTop: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 800 }}>Classes I teach</h2>
            <p style={{ margin: "0.35rem 0 0", fontSize: "0.8125rem", color: "var(--eduos-text-muted)" }}>
              Post and manage homework for your subject-teaching classes.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => setShowForm(true)}
            disabled={!data?.canAssign || pending}
            style={smallBtnStyle}
          >
            Assign homework
          </Button>
        </div>

        {!data?.canAssign ? (
          <p style={{ marginTop: "0.75rem", color: "var(--eduos-text-muted)" }}>
            No subject teaching assignments yet. Contact admin to assign you via Staffing.
          </p>
        ) : (
          <>
            <PortalFilterBar
              search={homeworkSearch}
              onSearchChange={setHomeworkSearch}
              searchPlaceholder="Search homework title or details…"
              total={data.otherClasses.homework.length}
              filtered={filteredTeachingHomework.length}
            />
            <FacultyHomeworkTable
              rows={filteredTeachingHomework}
            canManageAll={false}
            currentUserId={facultyUserId}
            pending={pending}
            onPublish={publishEntry}
            onDelete={deleteEntry}
            emptyMessage="No homework posted by you yet."
          />
          </>
        )}
      </section>

      {showForm ? (
        <section style={{ ...cardStyle, marginTop: "1rem" }}>
          <h3 style={{ margin: "0 0 0.75rem", fontWeight: 800 }}>New homework (Classes I teach)</h3>
          <label style={{ fontSize: "0.8125rem", display: "block", marginBottom: "0.75rem" }}>
            Class
            <select
              className="eduos-input"
              value={form.classSectionId}
              onChange={(e) => setForm((f) => ({ ...f, classSectionId: e.target.value }))}
              style={{ display: "block", marginTop: "0.25rem", width: "100%" }}
            >
              {teachingClasses.map((c) => (
                <option key={c.classSectionId} value={c.classSectionId}>
                  {c.classLabel}
                </option>
              ))}
            </select>
          </label>
          <Input label="Date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
          <div style={{ marginTop: "0.75rem" }}>
            <Input label="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </div>
          <div style={{ marginTop: "0.75rem" }}>
            <label style={{ fontSize: "0.8125rem", fontWeight: 600 }}>Details</label>
            <textarea
              className="eduos-input"
              rows={4}
              value={form.details}
              onChange={(e) => setForm((f) => ({ ...f, details: e.target.value }))}
              style={{ width: "100%", marginTop: "0.25rem" }}
            />
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.75rem", fontSize: "0.875rem" }}>
            <input
              type="checkbox"
              checked={!!form.publish}
              onChange={(e) => setForm((f) => ({ ...f, publish: e.target.checked }))}
            />
            Publish immediately
          </label>
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", flexWrap: "wrap" }}>
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)} style={smallBtnStyle}>
              Cancel
            </Button>
            <Button type="button" variant="secondary" onClick={() => save(false)} disabled={pending} style={smallBtnStyle}>
              Save draft
            </Button>
            <Button type="button" onClick={() => save(true)} disabled={pending} style={smallBtnStyle}>
              Publish
            </Button>
          </div>
        </section>
      ) : null}
    </FacultyShell>
  );
}
