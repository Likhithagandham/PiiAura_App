"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type {
  ExamMarkEntry,
  ExamSlot,
  ExaminationsData,
  ResultPublishConfirmation,
  ResultsAnalytics,
  SaveExamSlotInput,
  SeatingPlan,
} from "@eduos/types";
import { Button } from "@eduos/ui";
import { AdminShell } from "../AdminShell";
import { AdminMessage, AdminTabs } from "../ui";
import { ExamSlotModal } from "./ExamSlotModal";
import { InvigilationTab } from "./InvigilationTab";
import { PublishConfirmModal } from "./PublishConfirmModal";
import { ResultsTab } from "./ResultsTab";
import { ScheduleTab } from "./ScheduleTab";
import { SeatingTab } from "./SeatingTab";
import { SCHOOL_EXAM_TABS, idemHeaders, sortSlots, type SchoolExamTab } from "./examUtils";
import { useExamSectionFilters } from "./useExamSectionFilters";
import { useApiData } from "@/lib/queries";

const EXAMINATIONS_KEY = ["api", "/api/admin/examinations"] as const;

export function ExaminationsView() {
  const queryClient = useQueryClient();
  const { data, error: queryError, refetch } = useApiData<ExaminationsData>("/api/admin/examinations");
  const load = refetch;
  const loadError = queryError
    ? queryError instanceof Error
      ? queryError.message
      : "Could not load examinations."
    : null;
  const [tab, setTab] = useState<SchoolExamTab>("Schedule");
  const [message, setMessage] = useState<string | null>(null);
  const [messageVariant, setMessageVariant] = useState<"success" | "error">("success");

  const [editing, setEditing] = useState<ExamSlot | null>(null);
  const [slotModalOpen, setSlotModalOpen] = useState(false);
  const [form, setForm] = useState<SaveExamSlotInput>({
    name: "Midterm",
    classSectionId: "",
    subjectId: "",
    date: new Date().toISOString().slice(0, 10),
    startTime: "09:00",
    endTime: "10:30",
    roomId: "",
    status: "draft",
    requiredInvigilators: 1,
  });
  const [bulkCreateSections, setBulkCreateSections] = useState<{ id: string; label: string }[] | null>(
    null,
  );
  const [clashes, setClashes] = useState<import("@eduos/types").ExamClash[]>([]);
  const [publishModal, setPublishModal] = useState<{
    examSlotId: string;
    token: string;
  } | null>(null);
  const [publishNote, setPublishNote] = useState("");
  const [publishPreview, setPublishPreview] = useState<ResultPublishConfirmation | null>(null);
  const [studentSearch, setStudentSearch] = useState("");

  const classSections = data?.classSections ?? [];
  const sortedSlots = useMemo(() => sortSlots(data?.slots ?? []), [data?.slots]);
  const filters = useExamSectionFilters(classSections, sortedSlots);

  useEffect(() => {
    setStudentSearch("");
  }, [tab, filters.sectionId, filters.slotId]);

  async function patchAction(
    body: Record<string, unknown>,
    options?: { reload?: boolean; silent?: boolean },
  ) {
    const res = await fetch("/api/admin/examinations/actions", {
      method: "PATCH",
      credentials: "include",
      headers: idemHeaders(),
      body: JSON.stringify(body),
    });

    const json = await res.json().catch(() => ({} as unknown));
    if (res.status === 409 && (json as { clashes?: unknown }).clashes) {
      setClashes((json as { clashes: import("@eduos/types").ExamClash[] }).clashes);
      setMessageVariant("error");
      setMessage("Cannot publish: exam slot clashes detected.");
      return null;
    }
    if (res.status === 409) {
      setMessageVariant("error");
      setMessage((json as { error?: string }).error ?? "Another admin updated this record. Refresh and retry.");
      return null;
    }
    if (!res.ok) {
      if (!options?.silent) {
        setMessageVariant("error");
        setMessage((json as { error?: string }).error ?? "Request failed");
      }
      return null;
    }

    setMessage(null);
    setClashes([]);
    if (options?.reload !== false) await load();
    return json;
  }

  async function downloadFromAction(body: Record<string, unknown>, fallbackName: string) {
    const res = await fetch("/api/admin/examinations/actions", {
      method: "PATCH",
      credentials: "include",
      headers: idemHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setMessageVariant("error");
      setMessage((json as { error?: string }).error ?? "Download failed");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fallbackName;
    a.click();
    URL.revokeObjectURL(url);
    setMessageVariant("success");
    setMessage("Download started.");
  }

  function openNew() {
    setBulkCreateSections(null);
    const firstClass = classSections[0]?.id ?? data?.classes?.[0]?.id ?? "";
    const firstSubject = data?.subjects?.[0]?.id ?? "";
    const firstRoom = data?.rooms?.[0]?.id ?? "";
    setEditing(null);
    setSlotModalOpen(true);
    setForm({
      name: "Midterm",
      classSectionId: filters.sectionId || firstClass,
      subjectId: firstSubject,
      date: new Date().toISOString().slice(0, 10),
      startTime: "09:00",
      endTime: "10:30",
      roomId: firstRoom,
      status: "draft",
      requiredInvigilators: 1,
    });
    setClashes([]);
  }

  function openBulkNew() {
    const sections = filters.sectionsForGrade.map((s) => ({
      id: s.id,
      label: s.section ?? s.label,
    }));
    if (!sections.length) return;
    setBulkCreateSections(sections);
    openNew();
  }

  function openEdit(slot: ExamSlot) {
    setBulkCreateSections(null);
    setEditing(slot);
    setSlotModalOpen(true);
    setForm({
      id: slot.id,
      name: slot.name,
      classSectionId: slot.classSectionId,
      subjectId: slot.subjectId,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      roomId: slot.roomId,
      status: slot.status,
      requiredInvigilators: slot.requiredInvigilators ?? 1,
    });
    setClashes([]);
  }

  async function submitSlot() {
    if (bulkCreateSections?.length) {
      let ok = true;
      for (const section of bulkCreateSections) {
        const res = await patchAction(
          {
            action: "save_slot",
            payload: {
              ...form,
              classSectionId: section.id,
              name: form.name || `Exam — ${section.label}`,
            },
          },
          { reload: false },
        );
        if (!res) ok = false;
      }
      if (ok) {
        setMessageVariant("success");
        setMessage(`Exam slots created for ${bulkCreateSections.length} sections.`);
        setBulkCreateSections(null);
        setSlotModalOpen(false);
        await load();
      }
      return;
    }

    const res = await patchAction({ action: "save_slot", payload: form });
    if (res) {
      setMessageVariant("success");
      setMessage(editing ? "Exam slot updated." : "Exam slot created.");
      setEditing(null);
      setSlotModalOpen(false);
    }
  }

  const seatingBySlot = useMemo(() => {
    const map = new Map<string, SeatingPlan>();
    for (const p of data?.seatingPlans ?? []) map.set(p.examSlotId, p);
    return map;
  }, [data?.seatingPlans]);

  const mergeSlotMarks = useCallback(
    (examSlotId: string, entries: ExamMarkEntry[]) => {
      // Optimistic in-place update of the cached data (avoids a full reload per mark).
      queryClient.setQueryData<ExaminationsData>(EXAMINATIONS_KEY, (prev) => {
        if (!prev) return prev;
        const rest = prev.markEntries.filter((e) => e.examSlotId !== examSlotId);
        return { ...prev, markEntries: [...rest, ...entries] };
      });
    },
    [queryClient],
  );

  async function handleLoadSlotMarks(examSlotId: string) {
    const res = await patchAction({ action: "load_slot_marks", examSlotId }, { reload: false, silent: true });
    if (res && (res as { entries?: ExamMarkEntry[] }).entries) {
      mergeSlotMarks(examSlotId, (res as { entries: ExamMarkEntry[] }).entries);
    }
  }

  async function saveMark(examSlotId: string, studentId: string, value: string, override?: boolean) {
    const trimmed = value.trim();
    const marks = trimmed === "" ? null : Number(trimmed);
    const res = await patchAction(
      {
        action: "save_marks",
        examSlotId,
        studentId,
        marks,
        override: override ?? false,
        overrideReason: override ? "Admin override" : "",
      },
      { reload: false },
    );
    if (res && (res as { entries?: ExamMarkEntry[] }).entries) {
      mergeSlotMarks(examSlotId, (res as { entries: ExamMarkEntry[] }).entries);
    }
  }

  async function handleSubmitMarks(examSlotId: string, override?: boolean): Promise<boolean> {
    const res = await patchAction(
      {
        action: "submit_slot_marks",
        examSlotId,
        override: override ?? false,
        overrideReason: override ? "Admin override" : "",
      },
      { reload: false },
    );
    if (res && (res as { entries?: ExamMarkEntry[] }).entries) {
      mergeSlotMarks(examSlotId, (res as { entries: ExamMarkEntry[] }).entries);
      setMessageVariant("success");
      setMessage("Marks submitted for this slot.");
      return true;
    }
    return false;
  }

  async function handlePreflightResults(examSlotId: string) {
    return (await patchAction({ action: "preflight_results", examSlotId }, { reload: false })) as
      | import("@eduos/types").ResultsPreflightResult
      | null;
  }

  async function handlePreflightSeating(examSlotIds: string[]) {
    const res = await patchAction({ action: "preflight_seating", examSlotIds }, { reload: false });
    return res as import("@eduos/types").SeatingPreflightResult | null;
  }

  async function handleGenerateSeatingBulk(payload: {
    examSlotIds?: string[];
    mode: import("@eduos/types").SeatingGenerateMode;
    hallRoomId?: string;
  }) {
    const res = await patchAction({ action: "generate_seating_bulk", ...payload });
    return res as { seatingPlans: SeatingPlan[]; errors: { examSlotId: string }[] } | null;
  }

  async function handleExportSeatingCsv(plans: SeatingPlan[]) {
    if (!plans.length || !data) return;
    const res = await fetch("/api/admin/examinations/actions", {
      method: "PATCH",
      credentials: "include",
      headers: idemHeaders(),
      body: JSON.stringify({
        action: "export_seating_csv",
        examSlotIds: plans.map((p) => p.examSlotId),
      }),
    });
    if (!res.ok) {
      setMessageVariant("error");
      setMessage("Export failed");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "seating-plans.csv";
    a.click();
    URL.revokeObjectURL(url);
    setMessageVariant("success");
    setMessage("Seating CSV downloaded.");
  }

  async function handleStartPublish(examSlotId: string) {
    const preview = (await patchAction({ action: "start_publish", examSlotId })) as
      | ResultPublishConfirmation
      | null;
    if (!preview) return null;
    setPublishPreview(preview);
    setPublishModal({ examSlotId, token: preview.token });
    setPublishNote("");
    return preview;
  }

  async function handleLoadAnalytics(examSlotId: string) {
    return (await patchAction({ action: "analytics", examSlotId })) as ResultsAnalytics | null;
  }

  return (
    <AdminShell title="Examinations">
      <AdminMessage variant={messageVariant}>{message}</AdminMessage>

      <AdminTabs
        tabs={SCHOOL_EXAM_TABS.map((t) => ({ id: t, label: t }))}
        active={tab}
        onChange={(t) => {
          setTab(t as SchoolExamTab);
          setMessage(null);
        }}
      />

      {!data ? (
        <div className="eduos-panel">
          <div style={{ fontWeight: 700, marginBottom: "0.35rem" }}>Examinations</div>
          <div
            style={{
              color: loadError ? "var(--eduos-danger)" : "var(--eduos-text-muted)",
              fontSize: "0.875rem",
            }}
          >
            {loadError ?? "Loading examinations…"}
          </div>
          <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem" }}>
            <Button type="button" onClick={() => load()}>
              Retry
            </Button>
          </div>
        </div>
      ) : (
        <>
          {tab === "Schedule" ? (
            <ScheduleTab
              data={data}
              filters={filters}
              onNew={openNew}
              onBulkNew={openBulkNew}
              onEdit={openEdit}
              onDelete={(slotId) => patchAction({ action: "delete_slot", slotId })}
            />
          ) : null}

          {tab === "Seating" ? (
            <SeatingTab
              data={data}
              seatingBySlot={seatingBySlot}
              onPreflight={handlePreflightSeating}
              onGenerateBulk={handleGenerateSeatingBulk}
              onExportCsv={handleExportSeatingCsv}
            />
          ) : null}

          {tab === "Invigilation" ? (
            <InvigilationTab
              data={data}
              filters={filters}
              onAutoAssign={() => patchAction({ action: "auto_invigilators" })}
              onAdd={(examSlotId, facultyId) =>
                patchAction({ action: "assign_invigilator", examSlotId, facultyId, mode: "add" })
              }
              onReplace={(examSlotId, facultyId, replaceFacultyId) =>
                patchAction({
                  action: "assign_invigilator",
                  examSlotId,
                  facultyId,
                  mode: "replace",
                  replaceFacultyId,
                })
              }
              onRemove={(examSlotId, facultyId) =>
                patchAction({ action: "assign_invigilator", examSlotId, facultyId, mode: "remove" })
              }
              onRequiredChange={(examSlotId, requiredInvigilators) =>
                patchAction({ action: "update_required_invigilators", examSlotId, requiredInvigilators })
              }
            />
          ) : null}

          {tab === "Results" ? (
            <ResultsTab
              data={data}
              studentSearch={studentSearch}
              onStudentSearchChange={setStudentSearch}
              onSaveMark={saveMark}
              onSubmitMarks={handleSubmitMarks}
              onPreflight={handlePreflightResults}
              onStartPublish={handleStartPublish}
              onRevise={(examSlotId, note) => patchAction({ action: "revise_result", examSlotId, note })}
              onLoadAnalytics={handleLoadAnalytics}
              onExportReportCard={(studentId, examSlotId) =>
                downloadFromAction({ action: "export_report_card", studentId, examSlotId }, "report-card.pdf")
              }
              onExportClassCsv={(examId, classSectionId) => {
                const examName = data.exams?.find((e) => e.id === examId)?.name ?? "exam";
                const classLabel =
                  data.classSections?.find((c) => c.id === classSectionId)?.label ?? "class";
                const safe = `${examName}-${classLabel}-results.csv`.replace(/[^\w.-]+/g, "-");
                downloadFromAction(
                  { action: "export_class_results_csv", examId, classSectionId },
                  safe,
                );
              }}
              onLoadSlotMarks={handleLoadSlotMarks}
            />
          ) : null}

          <ExamSlotModal
            data={data}
            open={slotModalOpen}
            editing={editing}
            form={form}
            clashes={clashes}
            onClose={() => {
              setEditing(null);
              setClashes([]);
              setSlotModalOpen(false);
            }}
            onChange={setForm}
            onSubmit={submitSlot}
          />

          {publishModal ? (
            <PublishConfirmModal
              preview={publishPreview}
              note={publishNote}
              onNoteChange={setPublishNote}
              onClose={() => {
                setPublishModal(null);
                setPublishPreview(null);
                setPublishNote("");
              }}
              onConfirm={async () => {
                const ok = await patchAction({
                  action: "confirm_publish",
                  examSlotId: publishModal.examSlotId,
                  token: publishModal.token,
                  note: publishNote,
                });
                if (ok) {
                  setMessageVariant("success");
                  setMessage("Results published.");
                  setPublishModal(null);
                  setPublishPreview(null);
                  setPublishNote("");
                }
              }}
            />
          ) : null}
        </>
      )}
    </AdminShell>
  );
}
