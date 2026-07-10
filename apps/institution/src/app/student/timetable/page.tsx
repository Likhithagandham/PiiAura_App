"use client";

import { EmptyState, SkeletonText } from "@eduos/ui";
import { StudentShell } from "@/components/student/StudentShell";
import { useApiData } from "@/lib/queries";

interface Period {
  subjectName: string;
  startTime: string;
  endTime: string;
  roomName: string;
  periodIndex: number;
}
interface Day {
  dayOfWeek: number;
  label: string;
  periods: Period[];
}

function hhmm(value: string): string {
  // "09:00:00" → "09:00"
  return value ? value.slice(0, 5) : "";
}

export default function StudentTimetablePage() {
  const { data, error: queryError } = useApiData<{ days?: Day[] }>("/api/student/timetable");
  const days = queryError ? [] : data?.days ?? null;
  const error = queryError ? (queryError instanceof Error ? queryError.message : "Failed to load") : null;

  return (
    <StudentShell title="Timetable">
      <p className="eduos-section-desc">Your weekly class timetable.</p>
      {error ? <p className="eduos-admin-message eduos-admin-message--error">{error}</p> : null}
      {days === null ? (
        <SkeletonText lines={4} />
      ) : days.length === 0 ? (
        <EmptyState title="No timetable yet" description="Your class timetable will appear here once published." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {days.map((d) => (
            <section key={d.dayOfWeek} className="eduos-panel">
              <h3 className="eduos-subsection-title" style={{ marginTop: 0, marginBottom: "0.5rem" }}>
                {d.label}
              </h3>
              <div className="eduos-table-wrap">
                <table className="eduos-admin-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Subject</th>
                      <th>Room</th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.periods.map((p, i) => (
                      <tr key={`${d.dayOfWeek}-${p.periodIndex}-${i}`}>
                        <td className="eduos-admin-table__nowrap">
                          {hhmm(p.startTime)}–{hhmm(p.endTime)}
                        </td>
                        <td>{p.subjectName}</td>
                        <td>{p.roomName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}
    </StudentShell>
  );
}
