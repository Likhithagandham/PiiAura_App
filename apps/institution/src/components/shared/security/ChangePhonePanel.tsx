"use client";

import { Button } from "@eduos/ui";
import { useState } from "react";

type Step = "idle" | "otp";

export function ChangePhonePanel() {
  const [step, setStep] = useState<Step>("idle");
  const [newPhone, setNewPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const sendOtp = async () => {
    const phone = newPhone.trim();
    if (!phone) {
      setError("Enter a phone number.");
      return;
    }
    setBusy(true);
    setError(null);
    setMessage(null);
    const res = await fetch("/api/auth/change-phone", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "initiate", newPhone: phone }),
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
    const res = await fetch("/api/auth/change-phone", {
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
    setMessage("Phone number updated successfully.");
    setStep("idle");
    setNewPhone("");
    setOtp("");
  };

  return (
    <section className="eduos-panel">
      <h2 className="eduos-section-title">Change phone number</h2>
      <p className="eduos-section-desc">A verification code will be sent to your new number.</p>
      {message ? <p className="eduos-admin-message">{message}</p> : null}
      {error ? <p className="eduos-admin-message eduos-admin-message--error">{error}</p> : null}
      {step === "idle" ? (
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "flex-end" }}>
          <label style={{ fontSize: "0.8125rem" }}>
            New phone number
            <input
              className="eduos-input eduos-input--field"
              style={{ display: "block", marginTop: "0.2rem", minWidth: "14rem" }}
              type="tel"
              placeholder="+91 98765 43210"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
            />
          </label>
          <Button type="button" className="eduos-admin-btn-sm" disabled={busy} onClick={sendOtp}>
            {busy ? "Sending…" : "Send OTP"}
          </Button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: "20rem" }}>
          <p style={{ fontSize: "0.875rem", margin: 0 }}>
            OTP sent to <strong>{newPhone}</strong>. Enter it below.
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
              Change number
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
