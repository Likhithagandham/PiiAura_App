"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { TenantLoginConfig } from "@eduos/types";
import { AUTH_ROUTES, OTP_RESEND_COOLDOWN_SEC, OTP_TTL_MIN } from "@eduos/constants";
import { AuthCard, Button, OtpInput, LoadingScreen } from "@eduos/ui";
import { RESET_FLOW_STORAGE_KEY } from "../page";

export default function VerifyOtpPage() {
  const router = useRouter();
  const [config, setConfig] = useState<TenantLoginConfig | null>(null);
  const [otpToken, setOtpToken] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(OTP_TTL_MIN * 60);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    fetch("/api/tenant-config")
      .then((r) => r.json())
      .then(setConfig);

    const raw = sessionStorage.getItem(RESET_FLOW_STORAGE_KEY);
    if (!raw) {
      router.replace(AUTH_ROUTES.forgotPassword);
      return;
    }
    const data = JSON.parse(raw) as
      | { otpToken: string }
      | { resetToken: string }
      | { selectionToken: string };

    // If the user navigates back/forward, sessionStorage may already be on a later step.
    if ("resetToken" in data && data.resetToken) {
      router.replace(AUTH_ROUTES.forgotPasswordNewPassword);
      return;
    }
    if ("selectionToken" in data && data.selectionToken) {
      router.replace(AUTH_ROUTES.forgotPasswordSelectAccount);
      return;
    }
    if ("otpToken" in data && data.otpToken) {
      setOtpToken(data.otpToken);
      return;
    }

    router.replace(AUTH_ROUTES.forgotPassword);
  }, [router]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  async function handleVerify() {
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/password-reset/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otpToken, otpCode: otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Invalid OTP");

      sessionStorage.setItem(
        RESET_FLOW_STORAGE_KEY,
        JSON.stringify({ resetToken: data.resetToken }),
      );
      router.push(AUTH_ROUTES.forgotPasswordNewPassword);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResend() {
    setError(null);
    try {
      const res = await fetch("/api/auth/password-reset/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otpToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Resend failed");
      setResendCooldown(OTP_RESEND_COOLDOWN_SEC);
      setCountdown(OTP_TTL_MIN * 60);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Resend failed");
    }
  }

  const mins = Math.floor(countdown / 60);
  const secs = countdown % 60;

  if (!config) return <LoadingScreen />;

  return (
    <AuthCard
      institutionName={config.institution_name}
      logoUrl={config.logo_url}
      title="Enter OTP"
    >
      <p
        style={{
          fontSize: "0.875rem",
          color: "var(--eduos-text-muted)",
          marginBottom: "1.25rem",
          textAlign: "center",
          lineHeight: 1.5,
        }}
      >
        Enter the 6-digit code sent to your phone.
      </p>

      {error ? (
        <div className="eduos-alert eduos-alert-error" style={{ marginBottom: "1rem" }}>
          {error}
        </div>
      ) : null}

      <OtpInput value={otp} onChange={setOtp} disabled={isLoading} />

      <p
        style={{
          textAlign: "center",
          fontSize: "0.8125rem",
          color: "var(--eduos-text-muted)",
          marginTop: "1rem",
        }}
      >
        {countdown > 0
          ? `Code expires in ${mins}:${secs.toString().padStart(2, "0")}`
          : "OTP expired. "}
        {countdown <= 0 ? (
          <a href={AUTH_ROUTES.forgotPassword} style={{ color: "var(--eduos-primary)" }}>
            Start over
          </a>
        ) : null}
      </p>

      <div style={{ marginTop: "1.25rem" }}>
        <Button
          type="button"
          disabled={otp.length !== 6 || isLoading || countdown <= 0}
          onClick={handleVerify}
        >
          {isLoading ? "Verifying…" : "Verify OTP"}
        </Button>
      </div>

      <p style={{ textAlign: "center", marginTop: "1rem" }}>
        <button
          type="button"
          disabled={resendCooldown > 0}
          onClick={handleResend}
          style={{
            background: "none",
            border: "none",
            color: resendCooldown > 0 ? "var(--eduos-text-muted)" : "var(--eduos-primary)",
            cursor: resendCooldown > 0 ? "not-allowed" : "pointer",
            fontSize: "0.875rem",
          }}
        >
          {resendCooldown > 0
            ? `Resend OTP (${resendCooldown}s)`
            : "Resend OTP"}
        </button>
      </p>
    </AuthCard>
  );
}
