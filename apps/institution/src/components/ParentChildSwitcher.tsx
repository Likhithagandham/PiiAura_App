"use client";

import { useState } from "react";
import type { StudentChild } from "@eduos/types";
import { useParentChild } from "@/lib/parent/parent-child-context";

interface ParentChildSwitcherProps {
  onChildChange?: (child: StudentChild) => void;
}

export function ParentChildSwitcher({ onChildChange }: ParentChildSwitcherProps) {
  const { children, activeChild, setChildId } = useParentChild();
  const [open, setOpen] = useState(false);

  if (children.length === 0) return null;

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          fontSize: "0.875rem",
          color: "#1a202c",
          padding: "0.375rem 0.75rem",
          border: "1px solid #cbd5e0",
          borderRadius: "6px",
          background: "#fff",
          cursor: "pointer",
        }}
      >
        Viewing: {activeChild?.name} ({activeChild?.classLabel}) ▼
      </button>
      {open ? (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: "0.25rem",
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            minWidth: "220px",
            zIndex: 10,
          }}
        >
          {children.map((child) => (
            <button
              key={child.id}
              type="button"
              onClick={() => {
                setChildId(child.id);
                setOpen(false);
                onChildChange?.(child);
              }}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "0.75rem 1rem",
                border: "none",
                color: "#1a202c",
                background: activeChild?.id === child.id ? "#e8f5f0" : "transparent",
                cursor: "pointer",
                fontSize: "0.875rem",
              }}
            >
              {child.name} — Class {child.classLabel}
              {activeChild?.id === child.id ? " ✓" : ""}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
