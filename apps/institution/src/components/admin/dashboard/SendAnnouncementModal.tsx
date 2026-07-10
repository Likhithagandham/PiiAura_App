"use client";

import { useState } from "react";
import type { AnnouncementChannel, AnnouncementTargetType } from "@eduos/types";
import { Button, Input } from "@eduos/ui";
import { AdminModal } from "../AdminModal";

type AudienceOptions = Record<string, { value: string; label: string }[]>;

interface SendAnnouncementModalProps {
  onClose: () => void;
  onSent: () => void;
  /** Per-audience dropdown options ({ batch: [...], department: [...], role: [...] }). */
  options?: AudienceOptions;
}

const TARGET_OPTIONS: { value: AnnouncementTargetType; label: string }[] = [
  { value: "all", label: "Everyone" },
  { value: "batch", label: "Batch / class" },
  { value: "department", label: "Department" },
  { value: "role", label: "Role (faculty, parent, etc.)" },
];

const CHANNEL_OPTIONS: { value: AnnouncementChannel; label: string; disabled?: boolean; hint?: string }[] = [
  { value: "in_app", label: "In-app (Notices)" },
  { value: "sms", label: "SMS", disabled: true, hint: "Coming soon" },
  { value: "email", label: "Email", disabled: true, hint: "Coming soon" },
];

export function SendAnnouncementModal({ onClose, onSent, options }: SendAnnouncementModalProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [targetType, setTargetType] = useState<AnnouncementTargetType>("all");
  const [targetValue, setTargetValue] = useState("");

  const currentOptions = (options ?? {})[targetType] ?? [];
  const targetLabel = currentOptions.find((o) => o.value === targetValue)?.label ?? "";
  const [channels, setChannels] = useState<AnnouncementChannel[]>(["in_app"]);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  function toggleChannel(ch: AnnouncementChannel) {
    const opt = CHANNEL_OPTIONS.find((o) => o.value === ch);
    if (opt?.disabled) return;
    setChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSending(true);
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          body,
          targetType,
          targetValue: targetType === "all" ? undefined : targetValue,
          targetLabel: targetType === "all" ? undefined : targetLabel,
          channels: channels.filter((c) => c === "in_app"),
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Failed to send");
      }
      onSent();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setSending(false);
    }
  }

  return (
    <AdminModal title="Send notice" onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <div>
          <label className="eduos-label" htmlFor="ann-body">
            Message
          </label>
          <textarea
            id="ann-body"
            className="eduos-input"
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            style={{ resize: "vertical" }}
          />
        </div>
        <div>
          <span className="eduos-label">Audience</span>
          <select
            className="eduos-input"
            value={targetType}
            onChange={(e) => {
              setTargetType(e.target.value as AnnouncementTargetType);
              setTargetValue("");
            }}
          >
            {TARGET_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        {targetType !== "all" ? (
          currentOptions.length > 0 ? (
            <div>
              <label className="eduos-label" htmlFor="ann-target">
                Target details
              </label>
              <select
                id="ann-target"
                className="eduos-input"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                required
              >
                <option value="" disabled>
                  Select…
                </option>
                {currentOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <Input
              label="Target details"
              placeholder="e.g. Class 10-A, Science dept, Parents"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              required
            />
          )
        ) : null}
        <div>
          <span className="eduos-label">Delivery</span>
          <p className="eduos-body-sm" style={{ margin: "0.25rem 0 0.5rem", color: "var(--eduos-text-muted)" }}>
            Only in-app delivery is available today. SMS and email will be enabled from Engagement → Delivery.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginTop: "0.5rem" }}>
            {CHANNEL_OPTIONS.map((ch) => (
              <label
                key={ch.value}
                style={{
                  fontSize: "0.875rem",
                  display: "flex",
                  gap: "0.375rem",
                  opacity: ch.disabled ? 0.55 : 1,
                }}
              >
                <input
                  type="checkbox"
                  checked={channels.includes(ch.value)}
                  disabled={ch.disabled}
                  onChange={() => toggleChannel(ch.value)}
                />
                {ch.label}
                {ch.hint ? (
                  <span style={{ fontSize: "0.75rem", color: "var(--eduos-text-muted)" }}>({ch.hint})</span>
                ) : null}
              </label>
            ))}
          </div>
        </div>
        {error ? <p className="eduos-field-error">{error}</p> : null}
        <Button type="submit" disabled={sending}>
          {sending ? "Publishing…" : "Publish notice"}
        </Button>
      </form>
    </AdminModal>
  );
}
