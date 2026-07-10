"use client";

import { Suspense, useState } from "react";
import type { StudentExamHubData } from "@eduos/types";
import { Button, SkeletonText, TruncatedText } from "@eduos/ui";
import { PortalTabs } from "@/components/layout/PortalTabs";
import { ComingSoonPanel } from "@/components/shared/ComingSoonPanel";
import { ExportCsvButton } from "@/components/shared/ExportCsvButton";
import { StudentPerformancePanel } from "@/components/student/panels/StudentPerformancePanel";
import { StudentResultsPanel } from "@/components/student/panels/StudentResultsPanel";
import { StudentShell } from "@/components/student/StudentShell";
import { useStudentUrlTab } from "@/lib/student/use-student-url-tab";
import { useApiData } from "@/lib/queries";

const TABS = ["schedule", "results", "ai-insights"] as const;
type ExamTab = (typeof TABS)[number];

function ExamsContent() {
  const [tab, setTab] = useStudentUrlTab(TABS, "schedule");
  const { data, error: queryError, refetch } = useApiData<StudentExamHubData>(
    "/api/student/exams",
  );
  const load = refetch;
  const error = queryError ? "Could not load exam hub." : null;
  const [message, setMessage] = useState<string | null>(null);

  async function download(action: string, fileName: string) {
    setMessage(null);
    const res = await fetch("/api/student/exams/actions", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, examSlotId: data?.upcomingExams?.[0]?.id ?? "exam-1" }),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setMessage(
        (json as { blockedReason?: string; error?: string }).blockedReason ??
          (json as { error?: string }).error ??
          "Download blocked",
      );
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    setMessage("Download started.");
  }

  return (
    <>
      {error ? <p className="eduos-admin-message eduos-admin-message--error">{error}</p> : null}
      {message ? <p className="eduos-admin-message">{message}</p> : null}
      <p className="eduos-section-desc">
        {data?.institutionType === "college"
          ? "Exam schedule, results, performance, and hall ticket downloads."
          : "Exam schedule, results, and performance."}
      </p>

      <PortalTabs
        className="eduos-portal-tabs"
        active={tab}
        onChange={setTab}
        tabs={[
          { id: "schedule", label: "Schedule" },
          { id: "results", label: "Results" },
          { id: "ai-insights", label: "AI performance" },
        ]}
      />

      {tab === "results" ? (
        <>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0.75rem" }}>
            <ExportCsvButton endpoint="/api/student/exports/results" label="Download my results CSV" />
          </div>
          <StudentResultsPanel />
          <StudentPerformancePanel />
        </>
      ) : null}

      {tab === "ai-insights" ? (
        <ComingSoonPanel
          title="AI performance analyzer"
          description="Get personalized insights on weak topics, predicted scores, and study recommendations based on your exam and assignment history. This feature is under development — check back in a future release."
        />
      ) : null}

      {tab === "schedule" ? (
        !data ? (
          <SkeletonText lines={4} />
        ) : (
          <>
            <section className="eduos-panel">
              <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
                <h2 className="eduos-section-title">Upcoming exams</h2>
                <Button type="button" className="eduos-admin-btn-sm" onClick={() => void load()}>
                  Refresh
                </Button>
              </div>
              <div className="eduos-table-wrap" style={{ marginTop: "0.5rem" }}>
                <table className="eduos-admin-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Subject</th>
                      <th>Room</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.upcomingExams.map((s) => (
                      <tr key={s.id}>
                        <td className="eduos-admin-table__nowrap">{s.date}</td>
                        <td className="eduos-admin-table__nowrap">
                          {s.startTime}–{s.endTime}
                        </td>
                        <td>
                          <TruncatedText text={s.subjectName} maxWidth="16rem" />
                        </td>
                        <td>
                          <TruncatedText text={s.roomName} maxWidth="16rem" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )
      ) : null}
    </>
  );
}

export default function StudentExamHubPage() {
  return (
    <StudentShell title="Exams">
      <Suspense fallback={<SkeletonText lines={4} />}>
        <ExamsContent />
      </Suspense>
    </StudentShell>
  );
}
