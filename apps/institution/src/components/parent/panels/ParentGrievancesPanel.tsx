"use client";

import type { ParentCreateGrievanceInput, ParentGrievancesData } from "@eduos/types";
import { Button, EmptyState, SkeletonText } from "@eduos/ui";
import { useCallback, useEffect, useState } from "react";
import { parentApiUrl, useParentChild } from "@/lib/parent/parent-child-context";

export function ParentGrievancesPanel() {
  const { childId } = useParentChild();
  const [data, setData] = useState<ParentGrievancesData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState<ParentCreateGrievanceInput>({
    category: "Academic",
    subject: "",
    description: "",
  });

  const load = useCallback(async () => {
    if (!childId) return;
    const res = await fetch(parentApiUrl("/api/parent/grievances", childId), {
      credentials: "include",
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError((json as { error?: string }).error ?? "Failed to load");
      return;
    }
    setData(json as ParentGrievancesData);
  }, [childId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <p className="eduos-section-desc">Raise and track grievances for your child.</p>
      {error ? <p className="eduos-admin-message eduos-admin-message--error">{error}</p> : null}
      {message ? <p className="eduos-admin-message">{message}</p> : null}

      <section className="eduos-panel">
        <h2 className="eduos-section-title">New grievance</h2>
        <input
          className="eduos-input eduos-input--field"
          placeholder="Subject"
          value={form.subject}
          onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
          style={{ display: "block", marginBottom: "0.5rem", maxWidth: "24rem" }}
        />
        <textarea
          className="eduos-input eduos-input--field"
          rows={3}
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          style={{ display: "block", maxWidth: "28rem", width: "100%" }}
        />
        <Button
          type="button"
          className="eduos-admin-btn-sm"
          style={{ marginTop: "0.5rem" }}
          onClick={async () => {
            if (!childId) return;
            const res = await fetch(parentApiUrl("/api/parent/grievances", childId), {
              method: "POST",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(form),
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok) {
              setMessage((json as { error?: string }).error ?? "Could not submit");
              return;
            }
            setMessage("Grievance submitted.");
            setForm({ category: "Academic", subject: "", description: "" });
            await load();
          }}
        >
          Submit
        </Button>
      </section>

      <section className="eduos-panel">
        <h2 className="eduos-section-title">Your grievances</h2>
        {!data ? (
          <SkeletonText lines={4} />
        ) : data.grievances.length === 0 ? (
          <EmptyState compact title="No grievances yet" description="Grievances you raise for your child will appear here." />
        ) : (
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {data.grievances.map((g) => (
              <li
                key={g.id}
                style={{
                  padding: "0.75rem 0",
                  borderBottom: "1px solid var(--eduos-border)",
                  fontSize: "0.8125rem",
                }}
              >
                <strong>{g.subject}</strong> · {g.status}
                <div style={{ color: "var(--eduos-text-muted)", marginTop: "0.25rem" }}>{g.description}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
