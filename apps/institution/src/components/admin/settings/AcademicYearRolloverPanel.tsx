"use client";

import { useMemo, useState } from "react";
import type { RolloverPreview, RolloverState, RolloverStudentPreview } from "@eduos/types";
import { Button, EmptyState, ListSearchBar, filterBySearch } from "@eduos/ui";
import { useApiData } from "@/lib/queries";
import { StepUpConfirmModal } from "./StepUpConfirmModal";

type WizardStep = 1 | 2 | 3 | "done";

function categorizeStudent(s: RolloverStudentPreview): "promoted" | "graduated" | "retained" {
  if (s.toClass === "Graduated") return "graduated";
  if (s.toClass.toLowerCase().includes("retained") || s.toClass.toLowerCase().includes("arrear")) {
    return "retained";
  }
  return "promoted";
}

function friendlyError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("no current academic year")) {
    return "Set a current academic year before starting rollover.";
  }
  if (m.includes("frozen") || m.includes("already rolled")) {
    return "This year was already rolled over.";
  }
  if (m.includes("stale") || m.includes("preview")) {
    return "The preview changed. Refresh and try again.";
  }
  if (m.includes("undo window") || m.includes("expired")) {
    return "The 24-hour undo window has passed.";
  }
  return message;
}

export function AcademicYearRolloverPanel() {
  const [step, setStep] = useState<WizardStep>(1);
  const [busy, setBusy] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [showList, setShowList] = useState(false);
  const [search, setSearch] = useState("");
  const [showUndoStepUp, setShowUndoStepUp] = useState(false);
  const [asyncRunning, setAsyncRunning] = useState(false);

  const { data, error: queryError, isPending: loading, refetch } = useApiData<{
    preview?: RolloverPreview;
    state?: RolloverState;
  }>("/api/admin/platform/rollover", {
    // While an async rollover job runs, poll until it reports a completion time.
    refetchInterval: asyncRunning
      ? (query) => (query.state.data?.state?.lastRolloverAt ? false : 3000)
      : false,
  });
  const load = refetch;
  const preview = data?.preview ?? null;
  const state = data?.state ?? null;
  const error = mutationError ?? (queryError ? "Could not load rollover preview." : null);
  // The async job finished once the polled state has a completion timestamp.
  const showAsyncRunning = asyncRunning && !state?.lastRolloverAt;

  const counts = useMemo(() => {
    const students = preview?.studentsToPromote ?? [];
    return {
      promoted: students.filter((s) => categorizeStudent(s) === "promoted").length,
      graduated: students.filter((s) => categorizeStudent(s) === "graduated").length,
      retained: students.filter((s) => categorizeStudent(s) === "retained").length,
    };
  }, [preview]);

  const filteredStudents = useMemo(
    () =>
      filterBySearch(preview?.studentsToPromote ?? [], search, (s) => [
        s.name,
        s.fromClass,
        s.toClass,
      ]),
    [preview, search],
  );

  async function executeRollover() {
    if (!preview) return;
    setBusy(true);
    setMutationError(null);
    try {
      const res = await fetch("/api/admin/platform/rollover", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", "Idempotency-Key": `rollover-${Date.now()}` },
        body: JSON.stringify({ expectedVersion: preview.version }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMutationError(friendlyError((json as { error?: string }).error ?? "Rollover failed"));
        return;
      }
      if ((json as { async?: boolean }).async) {
        setAsyncRunning(true);
        setMutationError(null);
        return;
      }
      await load();
      setStep("done");
      setConfirmed(false);
    } catch {
      setMutationError("Rollover failed");
    } finally {
      setBusy(false);
    }
  }

  async function undoRollover() {
    setBusy(true);
    setMutationError(null);
    try {
      const res = await fetch("/api/admin/platform/rollover/undo", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": `rollover-undo-${Date.now()}`,
          "X-Step-Up-Verified": "true",
        },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMutationError(friendlyError((json as { error?: string }).error ?? "Undo failed"));
        return;
      }
      setShowUndoStepUp(false);
      setStep(1);
      setConfirmed(false);
      await load();
    } catch {
      setMutationError("Undo failed");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <p style={{ fontSize: "0.875rem", color: "var(--eduos-text-muted)" }}>Loading rollover…</p>;
  }

  if (!preview && !state?.canUndo) {
    return (
      <EmptyState
        title="Rollover unavailable"
        description={error ?? "Set a current academic year to preview year-end promotions."}
      />
    );
  }

  if (showAsyncRunning) {
    return (
      <section className="eduos-panel">
        <p style={{ margin: 0, fontSize: "0.875rem" }}>
          Rollover is running for {preview?.studentsToPromote.length ?? "many"} students. This page will
          update when complete.
        </p>
      </section>
    );
  }

  if (step === "done" || state?.canUndo) {
    return (
      <section className="eduos-panel" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <h4 className="eduos-subsection-title" style={{ margin: 0 }}>
          New academic year started
        </h4>
        {preview ? (
          <p style={{ margin: 0, fontSize: "0.875rem" }}>
            <strong>{preview.fromYearLabel}</strong> ended. <strong>{preview.toYearLabel}</strong> is now
            current.
          </p>
        ) : null}
        <div style={{ fontSize: "0.875rem", color: "var(--eduos-text-muted)" }}>
          <p style={{ margin: "0 0 0.5rem", fontWeight: 600, color: "var(--eduos-text)" }}>
            After rollover checklist
          </p>
          <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
            <li>Regenerate class timetables</li>
            <li>Review fee plans for the new year</li>
            <li>Notify staff about the new academic year</li>
          </ul>
        </div>
        {state?.canUndo ? (
          <Button type="button" variant="secondary" onClick={() => setShowUndoStepUp(true)} disabled={busy}>
            Undo and restore previous year
          </Button>
        ) : null}
        {state?.undoExpiresAt ? (
          <p style={{ fontSize: "0.75rem", color: "var(--eduos-text-muted)", margin: 0 }}>
            Undo available until {new Date(state.undoExpiresAt).toLocaleString()}
          </p>
        ) : null}
        {showUndoStepUp ? (
          <StepUpConfirmModal
            title="Undo rollover"
            description="Re-enter your password to undo the academic year rollover and restore the previous year."
            confirmLabel="Undo rollover"
            onClose={() => setShowUndoStepUp(false)}
            onVerified={undoRollover}
          />
        ) : null}
        {error ? <p className="eduos-field-error">{error}</p> : null}
      </section>
    );
  }

  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        paddingTop: "1rem",
        borderTop: "1px solid var(--eduos-border)",
      }}
    >
      <div>
        <h4 className="eduos-subsection-title" style={{ margin: "0 0 0.35rem" }}>
          End year &amp; promote students
        </h4>
        <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--eduos-text-muted)" }}>
          Manual process only. Review who moves up before you start{" "}
          {preview ? preview.toYearLabel : "the next year"}.
        </p>
      </div>

      {error ? <p className="eduos-field-error">{error}</p> : null}

      {step === 1 ? (
        <div className="eduos-panel">
          <h5 style={{ margin: "0 0 0.75rem", fontWeight: 600 }}>What happens when you start a new year?</h5>
          <ul style={{ margin: 0, paddingLeft: "1.25rem", fontSize: "0.875rem", lineHeight: 1.6 }}>
            <li>The current academic year is locked — no further edits to that year&apos;s structure.</li>
            <li>A new academic year is created and set as current.</li>
            <li>Students move up one class, graduate, or stay back (if arrears apply).</li>
            <li>Class timetables must be rebuilt for the new year.</li>
          </ul>
          <div style={{ marginTop: "1rem" }}>
            <Button type="button" onClick={() => setStep(2)}>
              Continue
            </Button>
          </div>
        </div>
      ) : null}

      {step === 2 && preview ? (
        <div className="eduos-panel">
          <h5 style={{ margin: "0 0 0.5rem", fontWeight: 600 }}>
            {preview.fromYearLabel} → {preview.toYearLabel}
          </h5>
          <p style={{ margin: "0 0 1rem", fontSize: "0.875rem" }}>
            {counts.promoted} promoted · {counts.graduated} graduating · {counts.retained} retained
          </p>
          <button
            type="button"
            onClick={() => setShowList((v) => !v)}
            style={{
              fontSize: "0.875rem",
              color: "var(--eduos-primary)",
              background: "none",
              border: "none",
              cursor: "pointer",
              textDecoration: "underline",
              padding: 0,
            }}
          >
            {showList ? "Hide full list" : "See full list"}
          </button>
          {showList ? (
            <div style={{ marginTop: "0.75rem" }}>
              <ListSearchBar
                value={search}
                onChange={setSearch}
                placeholder="Search student or class…"
                total={preview.studentsToPromote.length}
                filtered={filteredStudents.length}
              />
              <ul
                style={{
                  fontSize: "0.8125rem",
                  maxHeight: "200px",
                  overflow: "auto",
                  margin: "0.5rem 0 0",
                  paddingLeft: "1.25rem",
                }}
              >
                {filteredStudents.map((s) => (
                  <li key={s.studentId}>
                    {s.name}: {s.fromClass} → {s.toClass}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem", flexWrap: "wrap" }}>
            <Button type="button" variant="secondary" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button type="button" onClick={() => setStep(3)}>
              Continue
            </Button>
          </div>
        </div>
      ) : null}

      {step === 3 && preview ? (
        <div className="eduos-panel">
          <h5 style={{ margin: "0 0 0.75rem", fontWeight: 600 }}>Start {preview.toYearLabel}?</h5>
          <label style={{ display: "flex", gap: "0.5rem", fontSize: "0.875rem", alignItems: "flex-start" }}>
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              style={{ marginTop: "0.2rem" }}
            />
            <span>
              I have reviewed promotions and understand this cannot be auto-reversed after 24 hours.
            </span>
          </label>
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem", flexWrap: "wrap" }}>
            <Button type="button" variant="secondary" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button type="button" disabled={!confirmed || busy} onClick={executeRollover}>
              {busy ? "Starting…" : "Start new academic year"}
            </Button>
            <button
              type="button"
              onClick={() => load()}
              style={{
                fontSize: "0.875rem",
                color: "var(--eduos-primary)",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              Refresh preview
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
