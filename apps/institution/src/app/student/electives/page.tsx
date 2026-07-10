"use client";

import { useMemo, useState } from "react";
import type { CollegeOnlyData } from "@eduos/types";
import { Button, InlineLoading } from "@eduos/ui";
import { DashboardShell } from "@/components/DashboardShell";
import { useApiData } from "@/lib/queries";

const cardStyle: React.CSSProperties = {
  background: "var(--eduos-card)",
  border: "1px solid var(--eduos-border)",
  borderRadius: "12px",
  padding: "1.25rem",
};

export default function StudentElectivesPage() {
  const { data, error: queryError, refetch } = useApiData<CollegeOnlyData>(
    "/api/student/electives",
  );
  const load = refetch;
  const error = queryError ? "Could not load electives." : null;
  const [message, setMessage] = useState<string | null>(null);
  const [picked, setPicked] = useState<Record<string, string[]>>({});

  const isCollege = data?.institutionType === "college";
  const rules = useMemo(() => data?.electiveRules ?? [], [data?.electiveRules]);

  return (
    <DashboardShell title="Electives">
      {error ? <p style={{ color: "var(--eduos-danger)" }}>{error}</p> : null}
      {message ? <p style={{ color: "var(--eduos-primary)" }}>{message}</p> : null}

      {!data ? (
        <InlineLoading />
      ) : !isCollege ? (
        <section style={cardStyle}>
          <div style={{ color: "var(--eduos-text-muted)" }}>
            Elective selection is not available for your institution.
          </div>
        </section>
      ) : rules.length === 0 ? (
        <section style={cardStyle}>
          <div style={{ color: "var(--eduos-text-muted)" }}>No elective rules published yet.</div>
        </section>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {rules.map((r) => {
            const key = `${r.semester}__${r.groupName}`;
            const sel = picked[key] ?? [];
            return (
              <section key={r.id} style={cardStyle}>
                <div style={{ fontWeight: 700 }}>
                  {r.semester} · {r.groupName}
                </div>
                <div style={{ marginTop: "0.25rem", color: "var(--eduos-text-muted)", fontSize: "0.8125rem" }}>
                  Select {r.minSelect}–{r.maxSelect}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.75rem" }}>
                  {r.allowedSubjectNames.map((name, idx) => {
                    const id = r.allowedSubjectIds[idx] ?? name;
                    const checked = sel.includes(id);
                    return (
                      <label key={id} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            const next = e.target.checked ? [...sel, id] : sel.filter((x) => x !== id);
                            setPicked((p) => ({ ...p, [key]: next }));
                          }}
                        />
                        {name}
                      </label>
                    );
                  })}
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
                  <Button
                    type="button"
                    style={{ width: "auto", padding: "0.5rem 0.75rem" }}
                    onClick={async () => {
                      setMessage(null);
                      const res = await fetch("/api/student/electives/actions", {
                        method: "PATCH",
                        credentials: "include",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          action: "save_selection",
                          payload: { semester: r.semester, groupName: r.groupName, selectedSubjectIds: sel },
                        }),
                      });
                      const json = await res.json().catch(() => ({}));
                      if (!res.ok) {
                        setMessage((json as { error?: string }).error ?? "Save failed");
                        return;
                      }
                      setMessage("Selection submitted.");
                      await load();
                    }}
                  >
                    Submit
                  </Button>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}

