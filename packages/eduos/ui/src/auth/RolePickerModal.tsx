"use client";

import { useState } from "react";
import type { DisambiguationAccount } from "@eduos/types";
import { Button } from "../components/Button";

interface RolePickerModalProps {
  title?: string;
  description?: string;
  accounts: DisambiguationAccount[];
  onContinue: (userId: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export function RolePickerModal({
  title = "Choose Account",
  description = "Multiple accounts found. Select which account to log into:",
  accounts,
  onContinue,
  isLoading = false,
  error = null,
}: RolePickerModalProps) {
  const [selectedId, setSelectedId] = useState(accounts[0]?.userId ?? "");

  async function handleContinue() {
    if (!selectedId || isLoading) return;
    await onContinue(selectedId);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="role-picker-title"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        zIndex: 50,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "var(--eduos-card)",
          borderRadius: "var(--eduos-radius-lg)",
          padding: "1.75rem",
          boxShadow: "var(--eduos-shadow)",
        }}
      >
        <h2
          id="role-picker-title"
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            marginBottom: "0.5rem",
            color: "var(--eduos-text)",
          }}
        >
          {title}
        </h2>
        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--eduos-text-muted)",
            marginBottom: "1.25rem",
            lineHeight: 1.5,
          }}
        >
          {description}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {accounts.map((account) => (
            <label
              key={account.userId}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.75rem",
                padding: "1rem",
                border: `2px solid ${
                  selectedId === account.userId
                    ? "var(--eduos-primary)"
                    : "var(--eduos-border)"
                }`,
                borderRadius: "var(--eduos-radius)",
                cursor: "pointer",
                background:
                  selectedId === account.userId
                    ? "var(--eduos-primary-light)"
                    : "transparent",
              }}
            >
              <input
                type="radio"
                name="account"
                value={account.userId}
                checked={selectedId === account.userId}
                onChange={() => setSelectedId(account.userId)}
                style={{ marginTop: "0.2rem" }}
              />
              <div>
                <div style={{ fontWeight: 600, color: "var(--eduos-text)" }}>
                  {account.name}
                </div>
                <div
                  style={{
                    fontSize: "0.8125rem",
                    color: "var(--eduos-text-muted)",
                    marginTop: "0.125rem",
                  }}
                >
                  {account.subtitle}
                </div>
              </div>
            </label>
          ))}
        </div>

        {error ? (
          <p
            role="alert"
            style={{
              marginTop: "1rem",
              fontSize: "0.875rem",
              color: "var(--eduos-danger)",
            }}
          >
            {error}
          </p>
        ) : null}

        <div style={{ marginTop: "1.25rem" }}>
          <Button
            type="button"
            disabled={!selectedId || isLoading}
            onClick={handleContinue}
          >
            {isLoading ? "Continuing…" : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
