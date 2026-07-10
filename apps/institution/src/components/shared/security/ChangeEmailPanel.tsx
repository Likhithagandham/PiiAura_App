"use client";

import { Button } from "@eduos/ui";
import { useState } from "react";

type Step = "idle" | "otp";

export function ChangeEmailPanel() {
  const [step, setStep] = useState<Step>("idle");
  const [newEmail, setNewEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const sendOtp = async () => {
    const email = newEmail.trim();
    if (!email) {
      setError("Enter an email address.");
      return;
    }
    setBusy(true);
    setError(null);
    setMessage(null);
    const res = await fetch("/api/auth/change-email", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "initiate", newEmail: email }),
    });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError((json as { error?: string }).error ?? "Failed to send OTP.");
      return;
    }
    setStep("otp");
  };

  const confirmOtp = async () => {
    const code = otp.trim();
    if (!code) {
      setError("Enter the OTP.");
      return;
    }
    setBusy(true);
    setError(null);
    const res = await fetch("/api/auth/change-email", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "confirm", otp: code }),
    });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError((json as { error?: string }).error ?? "Invalid OTP.");
      return;
    }
    setMessage("Email updated successfully.");
    setStep("idle");
    setNewEmail("");
    setOtp("");
  };

  return (
    <section className="eduos-panel">
      <h2 className="eduos-section-title">Change email address</h2>
      <p className="eduos-section-desc">A verification code will be sent to your new email address.</p>
      {message ? <p className="eduos-admin-message">{message}</p> : null}
      {error ? <p className="eduos-admin-message eduos-admin-message--error">{error}</p> : null}
      {step === "idle" ? (
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "flex-end" }}>
          <label style={{ fontSize: "0.8125rem" }}>
            New email address
            <input
              className="eduos-input eduos-input--field"
              style={{ display: "block", marginTop: "0.2rem", minWidth: "16rem" }}
              type="email"
              placeholder="you@example.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
          </label>
          <Button type="button" className="eduos-admin-btn-sm" disabled={busy} onClick={sendOtp}>
            {busy ? "Sending…" : "Send OTP"}
          </Button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: "20rem" }}>
          <p style={{ fontSize: "0.875rem", margin: 0 }}>
            OTP sent to <strong>{newEmail}</strong>. Enter it below.
          </p>
          <input
            className="eduos-input eduos-input--field"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Button type="button" className="eduos-admin-btn-sm" disabled={busy} onClick={confirmOtp}>
              {busy ? "Verifying…" : "Verify & update"}
            </Button>
            <button
              type="button"
              style={{ background: "none", border: "none", color: "var(--eduos-muted, #64748b)", fontSize: "0.8125rem", cursor: "pointer" }}
              onClick={() => { setStep("idle"); setError(null); setOtp(""); }}
            >
              Change email
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
