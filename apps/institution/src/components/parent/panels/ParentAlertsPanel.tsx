"use client";

import type { ParentAbsenceAlertPrefs } from "@eduos/types";
import { Button, SkeletonText } from "@eduos/ui";
import { useCallback, useEffect, useState } from "react";
import { parentApiUrl, useParentChild } from "@/lib/parent/parent-child-context";

export function ParentAlertsPanel() {
  const { childId } = useParentChild();
  const [prefs, setPrefs] = useState<ParentAbsenceAlertPrefs | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!childId) return;
    const res = await fetch(parentApiUrl("/api/parent/absence-alerts", childId), {
      credentials: "include",
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok) setPrefs(json as ParentAbsenceAlertPrefs);
  }, [childId]);

  useEffect(() => {
    load();
  }, [load]);

  if (!prefs) return <SkeletonText lines={4} />;

  return (
    <section className="eduos-panel">
      <h2 className="eduos-section-title">Absence alerts</h2>
      <p className="eduos-section-desc">
        Per-child absence alert channels (applied in addition to your account notification preferences).
      </p>
      {message ? <p className="eduos-admin-message">{message}</p> : null}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem" }}>
        {(
          [
            ["sms", "SMS"],
            ["in_app", "In-app"],
            ["email", "Email"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} style={{ fontSize: "0.8125rem", display: "flex", gap: "0.5rem" }}>
            <input
              type="checkbox"
              checked={prefs[key]}
              onChange={(e) => setPrefs((p) => (p ? { ...p, [key]: e.target.checked } : p))}
            />
            {label}
          </label>
        ))}
      </div>
      <Button
        type="button"
        className="eduos-admin-btn-sm"
        style={{ marginTop: "0.75rem" }}
        onClick={async () => {
          if (!childId || !prefs) return;
          const res = await fetch(parentApiUrl("/api/parent/absence-alerts", childId), {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(prefs),
          });
          if (!res.ok) {
            setMessage("Could not save");
            return;
          }
          setMessage("Alert preferences saved.");
          await load();
        }}
      >
        Save preferences
      </Button>
    </section>
  );
}
