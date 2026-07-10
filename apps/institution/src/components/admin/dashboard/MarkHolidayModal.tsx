"use client";

import { useState } from "react";
import type { HolidayScope } from "@eduos/types";
import { Button, Input } from "@eduos/ui";
import { useApiData } from "@/lib/queries";
import { AdminModal } from "../AdminModal";

interface MarkHolidayModalProps {
  onClose: () => void;
  onSaved: () => void;
}

export function MarkHolidayModal({ onClose, onSaved }: MarkHolidayModalProps) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [scope, setScope] = useState<HolidayScope>("institution");
  const [classIds, setClassIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Shares the /api/admin/holidays cache key with HolidayCalendarPanel.
  const { data: holidaysData, isPending: loadingClasses } = useApiData<{
    classOptions?: { id: string; label: string }[];
  }>("/api/admin/holidays");
  const classOptions = holidaysData?.classOptions ?? [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (scope === "classes" && classIds.length === 0) {
      setError("Select at least one class.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/holidays", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          date,
          scope,
          classIds: scope === "classes" ? classIds : [],
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Failed to save holiday");
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  function toggleClass(id: string) {
    setClassIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  }

  return (
    <AdminModal title="Mark holiday" onClose={onClose}>
      <p style={{ fontSize: "0.875rem", color: "var(--eduos-text-muted)", marginBottom: "1rem" }}>
        Attendance cannot be marked on declared holidays.
      </p>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <Input label="Holiday name" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <div>
          <span className="eduos-label">Applies to</span>
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
            {(["institution", "classes"] as const).map((s) => (
              <label key={s} style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.875rem" }}>
                <input
                  type="radio"
                  name="scope"
                  checked={scope === s}
                  onChange={() => setScope(s)}
                />
                {s === "institution" ? "Whole institution" : "Selected classes"}
              </label>
            ))}
          </div>
        </div>
        {scope === "classes" ? (
          <div>
            <span className="eduos-label">Select classes</span>
            {loadingClasses ? (
              <p style={{ fontSize: "0.8125rem", color: "var(--eduos-text-muted)", marginTop: "0.5rem" }}>
                Loading classes…
              </p>
            ) : classOptions.length === 0 ? (
              <p style={{ fontSize: "0.8125rem", color: "var(--eduos-text-muted)", marginTop: "0.5rem" }}>
                No classes found for your branch. Add classes under Academics first.
              </p>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
                {classOptions.map((c) => (
                  <label
                    key={c.id}
                    style={{
                      fontSize: "0.8125rem",
                      padding: "0.375rem 0.625rem",
                      border: `1px solid ${classIds.includes(c.id) ? "var(--eduos-primary)" : "var(--eduos-border)"}`,
                      borderRadius: "var(--eduos-radius)",
                      background: classIds.includes(c.id) ? "var(--eduos-primary-light)" : "transparent",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={classIds.includes(c.id)}
                      onChange={() => toggleClass(c.id)}
                      style={{ marginRight: "0.375rem" }}
                    />
                    {c.label}
                  </label>
                ))}
              </div>
            )}
          </div>
        ) : null}
        {error ? <p className="eduos-field-error">{error}</p> : null}
        <Button
          type="submit"
          disabled={saving || (scope === "classes" && (loadingClasses || classOptions.length === 0))}
        >
          {saving ? "Saving…" : "Save holiday"}
        </Button>
      </form>
    </AdminModal>
  );
}
