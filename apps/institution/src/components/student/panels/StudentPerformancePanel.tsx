"use client";

import type { StudentPerformanceData } from "@eduos/types";
import { BarChart, ProgressRing, InlineLoading, Sparkline } from "@eduos/ui";
import { useState } from "react";
import { useApiData } from "@/lib/queries";

function performanceColor(pct: number): string {
  return pct >= 75 ? "#1a5f4a" : pct >= 50 ? "#d69e2e" : "#dc2626";
}

export function StudentPerformancePanel() {
  const { data, error: queryError } = useApiData<StudentPerformanceData>("/api/student/performance");
  const error = queryError ? (queryError instanceof Error ? queryError.message : "Failed to load") : null;
  const [message] = useState<string | null>(null);
  const [selectedTest, setSelectedTest] = useState("");

  if (error) return <p className="eduos-admin-message eduos-admin-message--error">{error}</p>;
  if (!data) return <InlineLoading />;

  // Tests available across all subjects, in chronological order (trends are time-ordered).
  const testOptions: string[] = [];
  for (const s of data.subjects) {
    for (const t of s.trend) {
      if (!testOptions.includes(t.label)) testOptions.push(t.label);
    }
  }
  // Default to the most recent test; user can pick any.
  const activeTest =
    selectedTest && testOptions.includes(selectedTest)
      ? selectedTest
      : (testOptions[testOptions.length - 1] ?? "");

  const selectedScores = data.subjects
    .map((s) => ({
      subjectName: s.subjectName,
      percent: s.trend.find((t) => t.label === activeTest)?.percent ?? null,
    }))
    .filter((x) => x.percent != null);

  const selectedAverage = selectedScores.length
    ? Math.round(
        selectedScores.reduce((sum, x) => sum + (x.percent as number), 0) / selectedScores.length,
      )
    : null;

  return (
    <>
      {message ? <p className="eduos-admin-message">{message}</p> : null}

      {testOptions.length > 0 ? (
        <section className="eduos-panel">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "0.75rem",
              flexWrap: "wrap",
            }}
          >
            <h2 className="eduos-section-title" style={{ margin: 0 }}>
              Performance overview
            </h2>
            <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8125rem" }}>
              Test:
              <select
                className="eduos-input"
                style={{ width: "auto" }}
                value={activeTest}
                onChange={(e) => setSelectedTest(e.target.value)}
              >
                {testOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="eduos-chart-split" style={{ marginTop: "0.75rem" }}>
            {selectedAverage != null ? (
              <ProgressRing
                percent={selectedAverage}
                color={performanceColor(selectedAverage)}
                label={`${selectedAverage}%`}
                caption={`${activeTest} average`}
              />
            ) : null}
            {selectedScores.length > 0 ? (
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 className="eduos-subsection-title" style={{ marginBottom: "0.75rem" }}>
                  Score by subject — {activeTest}
                </h3>
                <BarChart
                  data={selectedScores.map((s) => ({
                    label: s.subjectName,
                    value: s.percent as number,
                    valueLabel: `${s.percent}%`,
                    color: performanceColor(s.percent as number),
                  }))}
                  height={180}
                />
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem" }}>
        {data.subjects.map((s) => {
          const selectedPoint = s.trend.find((t) => t.label === activeTest);
          const headlinePercent = selectedPoint?.percent ?? null;
          return (
            <section key={s.subjectName} className="eduos-panel" style={{ padding: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ fontWeight: 700, fontSize: "0.875rem" }}>{s.subjectName}</div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  {s.trend.length > 1 ? (
                    <Sparkline
                      data={s.trend.map((t) => t.percent)}
                      color={performanceColor(headlinePercent ?? s.trend[s.trend.length - 1]!.percent)}
                      fill
                    />
                  ) : null}
                  <div style={{ fontSize: "0.8125rem" }}>
                    {activeTest || "Latest"}:{" "}
                    {headlinePercent == null ? "—" : `${headlinePercent}%`}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                {s.trend.map((t) => {
                  const isActive = t.label === activeTest;
                  return (
                    <span
                      key={t.label}
                      style={{
                        fontSize: "0.6875rem",
                        padding: "0.2rem 0.45rem",
                        borderRadius: "var(--eduos-radius)",
                        border: `1px solid ${isActive ? "var(--eduos-primary)" : "var(--eduos-border)"}`,
                        background: isActive ? "var(--eduos-primary)" : "transparent",
                        color: isActive ? "#fff" : "var(--eduos-text-muted)",
                        fontWeight: isActive ? 600 : 400,
                      }}
                    >
                      {t.label}: {t.percent}%
                    </span>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
