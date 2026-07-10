"use client";

import { useCallback, useEffect, useState } from "react";
import type { ParentResultsData } from "@eduos/types";
import {
  BarChart,
  EmptyState,
  IconChartBar,
  IconTrendUp,
  SkeletonText,
  StatCard,
  TruncatedText,
  chartColor,
} from "@eduos/ui";
import { parentApiUrl, useParentChild } from "@/lib/parent/parent-child-context";

export function ParentResultsPanel() {
  const { childId } = useParentChild();
  const [data, setData] = useState<ParentResultsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!childId) return;
    const res = await fetch(parentApiUrl("/api/parent/results", childId), { credentials: "include" });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError((json as { error?: string }).error ?? "Failed to load");
      return;
    }
    setData(json as ParentResultsData);
  }, [childId]);

  useEffect(() => {
    load();
  }, [load]);

  if (error) return <p className="eduos-admin-message eduos-admin-message--error">{error}</p>;
  if (!data) return <SkeletonText lines={4} />;

  const scored = data.results.filter((r) => r.percent != null);

  return (
    <section className="eduos-panel">
      {data.gpa ? (
        <div className="eduos-admin-stat-grid" style={{ marginBottom: "1rem" }}>
          <StatCard label="SGPA" value={data.gpa.sgpa} icon={<IconChartBar />} accent="#2563eb" />
          <StatCard label="CGPA" value={data.gpa.cgpa} icon={<IconTrendUp />} accent="#1a5f4a" />
        </div>
      ) : null}
      {scored.length > 0 ? (
        <div style={{ marginBottom: "1rem" }}>
          <h3 className="eduos-subsection-title">Scores by subject</h3>
          <BarChart
            data={scored.map((r, i) => ({
              label: r.subjectName,
              value: r.percent as number,
              color: chartColor(i),
              valueLabel: `${r.percent}%`,
            }))}
          />
        </div>
      ) : null}
      {data.results.length === 0 ? (
        <EmptyState compact title="No published results" description="Published results for your child will appear here." />
      ) : (
        <div className="eduos-table-wrap">
          <table className="eduos-admin-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Published</th>
                <th>Score</th>
                <th>Remark</th>
              </tr>
            </thead>
            <tbody>
              {data.results.map((r) => (
                <tr key={r.examSlotId}>
                  <td>
                    <TruncatedText text={r.subjectName} maxWidth="16rem" />
                  </td>
                  <td className="eduos-admin-table__nowrap">
                    {new Date(r.publishedAt).toLocaleDateString()}
                  </td>
                  <td>{r.percent != null ? `${r.percent}%` : "—"}</td>
                  <td>
                    <TruncatedText text={r.remark} maxWidth="16rem" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
