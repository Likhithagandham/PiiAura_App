"use client";

import type { StudentAssignmentsData } from "@eduos/types";
import { Button, EmptyState, SkeletonText } from "@eduos/ui";
import { useState } from "react";
import { useApiData } from "@/lib/queries";

export function StudentAssignmentsPanel() {
  const { data, error: queryError, refetch } = useApiData<StudentAssignmentsData>(
    "/api/student/assignments",
  );
  const load = refetch;
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [fileName, setFileName] = useState("assignment.pdf");

  const displayError = error ?? (queryError ? "Failed to load." : null);

  function submissionFor(assignmentId: string) {
    return data?.submissions.find((s) => s.assignmentId === assignmentId);
  }

  return (
    <>
      {displayError ? (
        <p className="eduos-admin-message eduos-admin-message--error">{displayError}</p>
      ) : null}
      {message ? <p className="eduos-admin-message">{message}</p> : null}
      {!data ? (
        <SkeletonText lines={4} />
      ) : data.assignments.length === 0 ? (
        <EmptyState title="No assignments" description="Assignments for your class will appear here." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {data.assignments.map((a) => {
            const sub = submissionFor(a.id);
            return (
              <section key={a.id} className="eduos-panel" style={{ padding: "0.75rem" }}>
                <div style={{ fontWeight: 700 }}>{a.title}</div>
                <p style={{ margin: "0.25rem 0", fontSize: "0.8125rem", color: "var(--eduos-text-muted)" }}>
                  {a.subjectName} · Due {new Date(a.dueAt).toLocaleString()}
                </p>
                <p style={{ margin: "0 0 0.5rem", fontSize: "0.8125rem" }}>{a.description}</p>
                {sub ? (
                  <p style={{ fontSize: "0.75rem", color: "var(--eduos-primary)" }}>
                    Submitted {new Date(sub.submittedAt).toLocaleString()} · {sub.attachmentName}
                  </p>
                ) : (
                  <div className="eduos-portal-toolbar">
                    <input
                      type="text"
                      className="eduos-input eduos-input--field"
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      placeholder="filename.pdf"
                    />
                    <Button
                      type="button"
                      className="eduos-admin-btn-sm"
                      onClick={async () => {
                        setMessage(null);
                        const res = await fetch("/api/student/assignments", {
                          method: "POST",
                          credentials: "include",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            assignmentId: a.id,
                            fileName: fileName.trim() || "assignment.pdf",
                            mimeType: "application/pdf",
                            sizeBytes: 120_000,
                          }),
                        });
                        const json = await res.json().catch(() => ({}));
                        if (!res.ok) {
                          setMessage((json as { error?: string }).error ?? "Upload failed");
                          return;
                        }
                        setMessage("Assignment submitted.");
                        await load();
                      }}
                    >
                      Upload
                    </Button>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}
