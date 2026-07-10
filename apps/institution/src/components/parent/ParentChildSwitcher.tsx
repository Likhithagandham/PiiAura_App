"use client";

import { useParentChild } from "@/lib/parent/parent-child-context";

export function ParentChildSwitcher() {
  const { children, childId, setChildId, loading } = useParentChild();

  if (loading || children.length === 0) return null;

  if (children.length === 1) {
    const only = children[0]!;
    return (
      <span style={{ fontSize: "0.8125rem", color: "var(--eduos-text-muted)" }}>
        {only.name} · {only.classLabel}
      </span>
    );
  }

  return (
    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem" }}>
      <span style={{ color: "var(--eduos-text-muted)", fontWeight: 600 }}>Child</span>
      <select
        className="eduos-input eduos-input--field"
        value={childId ?? children[0]?.id ?? ""}
        onChange={(e) => setChildId(e.target.value)}
        style={{ minWidth: "12rem", padding: "0.35rem 0.5rem" }}
      >
        {children.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name} ({c.classLabel})
          </option>
        ))}
      </select>
    </label>
  );
}
