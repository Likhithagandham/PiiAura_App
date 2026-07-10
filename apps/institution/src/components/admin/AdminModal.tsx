"use client";

import type { ReactNode } from "react";

interface AdminModalProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}

export function AdminModal({ title, children, onClose, wide = false }: AdminModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        zIndex: 60,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: wide ? "560px" : "480px",
          maxHeight: "min(90vh, 720px)",
          overflow: "auto",
          background: "var(--eduos-card)",
          borderRadius: "var(--eduos-radius-lg)",
          padding: "1.5rem",
          boxShadow: "var(--eduos-shadow-lg)",
          border: "1px solid var(--eduos-border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.25rem",
          }}
        >
          <h2 style={{ fontSize: "1.125rem", fontWeight: 700 }}>{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "none",
              border: "none",
              fontSize: "1.25rem",
              cursor: "pointer",
              color: "var(--eduos-text-muted)",
            }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
