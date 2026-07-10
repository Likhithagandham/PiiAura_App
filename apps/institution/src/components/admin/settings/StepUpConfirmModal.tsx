"use client";

import { useState } from "react";
import { Button, Input, Modal } from "@eduos/ui";

interface StepUpConfirmModalProps {
  title?: string;
  description?: string;
  confirmLabel?: string;
  onClose: () => void;
  onVerified: () => void | Promise<void>;
}

export function StepUpConfirmModal({
  title = "Confirm your password",
  description = "This action requires you to re-enter your password.",
  confirmLabel = "Confirm",
  onClose,
  onVerified,
}: StepUpConfirmModalProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/admin/step-up", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((json as { error?: string }).error ?? "Verification failed");
        return;
      }
      await onVerified();
    } catch {
      setError("Verification failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      title={title}
      onClose={busy ? undefined : onClose}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" form="step-up-form" disabled={busy || !password}>
            {busy ? "Verifying…" : confirmLabel}
          </Button>
        </>
      }
    >
      <form id="step-up-form" onSubmit={handleSubmit}>
        <p style={{ marginTop: 0, fontSize: "0.875rem", color: "var(--eduos-text-muted)" }}>
          {description}
        </p>
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
        {error ? <p className="eduos-field-error">{error}</p> : null}
      </form>
    </Modal>
  );
}
