"use client";

import type { StudentResultsData } from "@eduos/types";
import {
  EmptyState,
  IconChartBar,
  InlineLoading,
  StatCard,
  TruncatedText,
} from "@eduos/ui";
import { useApiData } from "@/lib/queries";

export function StudentResultsPanel() {
  const { data, error: queryError } = useApiData<StudentResultsData>("/api/student/results");
  const error = queryError ? (queryError instanceof Error ? queryError.message : "Failed to load") : null;

  if (error) return <p className="eduos-admin-message eduos-admin-message--error">{error}</p>;
  if (!data) return <InlineLoading />;

  // Group results by test/exam (results arrive newest-first), so each test shows
  // its subjects together under one header.
  const testGroups: { examLabel: string; publishedAt: string; rows: typeof data.results }[] = [];
  for (const r of data.results) {
    const key = r.examLabel || "Results";
    let group = testGroups.find((g) => g.examLabel === key);
    if (!group) {
      group = { examLabel: key, publishedAt: r.publishedAt, rows: [] };
      testGroups.push(group);
    }
    group.rows.push(r);
  }

  function publishedLabel(value: string): string {
    const d = value ? new Date(value) : null;
    return d && !Number.isNaN(d.getTime()) ? d.toLocaleDateString() : "—";
  }

  return (
    <>
      {data.institutionType === "college" && data.gpa ? (
        <div className="eduos-admin-stat-grid">
          <StatCard label="SGPA" value={data.gpa.sgpa.toFixed(2)} icon={<IconChartBar />} accent="#2563eb" />
          <StatCard
            label="CGPA"
            value={data.gpa.cgpa.toFixed(2)}
            icon={<IconChartBar />}
            accent="#7c3aed"
            sub={`As of ${new Date(data.gpa.calculatedAt).toLocaleDateString()}`}
          />
        </div>
      ) : null}
      <section className="eduos-panel">
        <h2 className="eduos-section-title">Published results</h2>
        {data.results.length === 0 ? (
          <EmptyState compact title="No published results" description="Results appear here once they are published." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginTop: "0.5rem" }}>
            {testGroups.map((group) => (
              <div key={group.examLabel}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    gap: "0.75rem",
                    marginBottom: "0.35rem",
                  }}
                >
                  <h3 className="eduos-subsection-title" style={{ margin: 0 }}>
                    {group.examLabel}
                  </h3>
                  <span style={{ fontSize: "0.75rem", color: "var(--eduos-text-muted)" }}>
                    {publishedLabel(group.publishedAt)}
                  </span>
                </div>
                <div className="eduos-table-wrap">
                  <table className="eduos-admin-table">
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>%</th>
                        <th>Remark</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.rows.map((r) => (
                        <tr key={r.examSlotId}>
                          <td>
                            <TruncatedText text={r.subjectName} maxWidth="16rem" />
                          </td>
                          <td>{r.percent == null ? "—" : `${r.percent}%`}</td>
                          <td>
                            <TruncatedText text={r.remark} maxWidth="12rem" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
