"use client";

import { useState } from "react";
import type { DisambiguationAccount } from "@eduos/types";
import { Button } from "../components/Button";

interface AccountPickerProps {
  title: string;
  description: string;
  accounts: DisambiguationAccount[];
  onContinue: (userId: string) => Promise<void>;
  isLoading?: boolean;
}

export function AccountPicker({
  title,
  description,
  accounts,
  onContinue,
  isLoading = false,
}: AccountPickerProps) {
  const [selectedId, setSelectedId] = useState(accounts[0]?.userId ?? "");

  return (
    <div>
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
                {account.name} — {account.subtitle.split(" — ")[0]}
              </div>
              <div
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--eduos-text-muted)",
                  marginTop: "0.125rem",
                }}
              >
                {account.subtitle.includes(" — ")
                  ? account.subtitle.split(" — ").slice(1).join(" — ")
                  : account.subtitle}
              </div>
            </div>
          </label>
        ))}
      </div>

      <div style={{ marginTop: "1.25rem" }}>
        <Button
          type="button"
          disabled={!selectedId || isLoading}
          onClick={() => onContinue(selectedId)}
        >
          {isLoading ? "Continuing…" : "Continue"}
        </Button>
      </div>
    </div>
  );
}
