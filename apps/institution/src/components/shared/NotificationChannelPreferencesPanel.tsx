"use client";

import type { NotificationPreferences } from "@eduos/types";
import { Button, SkeletonText } from "@eduos/ui";
import { useCallback, useEffect, useState } from "react";

const CHANNELS = [
  { key: "in_app" as const, label: "In-app" },
  { key: "sms" as const, label: "SMS" },
  { key: "email" as const, label: "Email" },
];

export function NotificationChannelPreferencesPanel({
  apiUrl,
  title = "Notification preferences",
  description = "Choose which channels you want to receive notifications on. Opted-out channels are skipped when the institution sends messages.",
}: {
  apiUrl: string;
  title?: string;
  description?: string;
}) {
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const res = await fetch(apiUrl, { credentials: "include" });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError((json as { error?: string }).error ?? "Failed to load preferences.");
      return;
    }
    setPrefs(json as NotificationPreferences);
  }, [apiUrl]);

  useEffect(() => {
    load();
  }, [load]);

  if (error) return <p className="eduos-admin-message eduos-admin-message--error">{error}</p>;
  if (!prefs) return <SkeletonText lines={4} />;

  return (
    <section className="eduos-panel">
      <h2 className="eduos-section-title">{title}</h2>
      <p className="eduos-section-desc">{description}</p>
      {message ? <p className="eduos-admin-message" style={{ marginTop: "0.5rem" }}>{message}</p> : null}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem", marginTop: "0.75rem" }}>
        {CHANNELS.map(({ key, label }) => (
          <label key={key} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem" }}>
            <input
              type="checkbox"
              checked={prefs.channels[key]}
              onChange={(e) => {
                setPrefs({ ...prefs, channels: { ...prefs.channels, [key]: e.target.checked } });
              }}
            />
            {label}
          </label>
        ))}
      </div>
      <div style={{ marginTop: "0.75rem" }}>
        <Button
          type="button"
          className="eduos-admin-btn-sm"
          onClick={async () => {
            setMessage(null);
            const res = await fetch(apiUrl, {
              method: "PATCH",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ channels: prefs.channels }),
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok) {
              setMessage((json as { error?: string }).error ?? "Save failed");
              return;
            }
            setPrefs(json as NotificationPreferences);
            setMessage("Preferences saved.");
          }}
        >
          Save preferences
        </Button>
      </div>
    </section>
  );
}
