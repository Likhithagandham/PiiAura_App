"use client";

import { useCallback, useEffect, useState } from "react";
import type { ParentAssignmentsData } from "@eduos/types";
import { ChartLegend, DonutChart, EmptyState, SkeletonText, TruncatedText } from "@eduos/ui";
import { parentApiUrl, useParentChild } from "@/lib/parent/parent-child-context";

export function ParentAssignmentsPanel() {
  const { childId } = useParentChild();
  const [data, setData] = useState<ParentAssignmentsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!childId) return;
    const res = await fetch(parentApiUrl("/api/parent/assignments", childId), {
      credentials: "include",
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError((json as { error?: string }).error ?? "Failed to load");
      return;
    }
    setData(json as ParentAssignmentsData);
  }, [childId]);

  useEffect(() => {
    load();
  }, [load]);

  if (error) return <p className="eduos-admin-message eduos-admin-message--error">{error}</p>;
  if (!data) return <SkeletonText lines={4} />;

  const submittedCount = data.assignments.filter((a) =>
    data.submissions.some((s) => s.assignmentId === a.id),
  ).length;
  const pendingCount = data.assignments.length - submittedCount;
  const statusDist = [
    { label: "Submitted", value: submittedCount, color: "#1a5f4a" },
    { label: "Pending", value: pendingCount, color: "#d69e2e" },
  ];

  return (
    <section className="eduos-panel">
      {data.assignments.length === 0 ? (
        <EmptyState compact title="No assignments" description="Your child's assignment status will appear here." />
      ) : (
        <>
          <div className="eduos-chart-split" style={{ marginBottom: "1rem" }}>
            <DonutChart
              data={statusDist}
              centerValue={data.assignments.length}
              centerLabel="Assignments"
            />
            <div className="eduos-chart-split__legend">
              <ChartLegend items={statusDist.map((d) => ({ label: d.label, color: d.color, value: d.value }))} />
            </div>
          </div>
          <div className="eduos-table-wrap">
          <table className="eduos-admin-table">
            <thead>
              <tr>
                <th>Assignment</th>
                <th>Due</th>
                <th>Status</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {data.assignments.map((a) => {
                const sub = data.submissions.find((s) => s.assignmentId === a.id);
                return (
                  <tr key={a.id}>
                    <td>
                      <TruncatedText text={a.title} maxWidth="16rem" />
                    </td>
                    <td className="eduos-admin-table__nowrap">
                      {new Date(a.dueAt).toLocaleDateString()}
                    </td>
                    <td>{sub ? "Submitted" : "Pending"}</td>
                    <td>
                      {sub
                        ? `${new Date(sub.submittedAt).toLocaleDateString()} · similarity ${sub.similarityPercent}%`
                        : "Not submitted"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </>
      )}
    </section>
  );
}
