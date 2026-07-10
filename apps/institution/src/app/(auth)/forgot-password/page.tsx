"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import type { DisambiguationAccount, TenantLoginConfig } from "@eduos/types";
import { AUTH_ROUTES } from "@eduos/constants";
import { AuthCard, Button, Input, LoadingScreen } from "@eduos/ui";

const STORAGE_KEY = "eduos_reset_flow";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [config, setConfig] = useState<TenantLoginConfig | null>(null);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch("/api/tenant-config")
      .then((r) => r.json())
      .then(setConfig);
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");

      if (data.type === "generic_sent") {
        setMessage(
          "If this number is registered, an OTP will be sent shortly.",
        );
        return;
      }

      if (data.type === "disambiguation") {
        sessionStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            selectionToken: data.selectionToken,
            accounts: data.accounts,
          }),
        );
        router.push(AUTH_ROUTES.forgotPasswordSelectAccount);
        return;
      }

      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ otpToken: data.otpToken }),
      );
      router.push(AUTH_ROUTES.forgotPasswordVerifyOtp);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setIsLoading(false);
    }
  }

  if (!config) return <LoadingScreen />;

  return (
    <AuthCard
      institutionName={config.institution_name}
      logoUrl={config.logo_url}
      title="Reset Your Password"
    >
      <form onSubmit={handleSubmit}>
        {error ? (
          <div className="eduos-alert eduos-alert-error" style={{ marginBottom: "1rem" }}>
            {error}
          </div>
        ) : null}
        {message ? (
          <div className="eduos-alert eduos-alert-info" style={{ marginBottom: "1rem" }}>
            {message}
          </div>
        ) : null}

        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--eduos-text-muted)",
            marginBottom: "1rem",
            lineHeight: 1.5,
          }}
        >
          Enter your registered phone number to receive a one-time password (OTP).
        </p>

        <div style={{ marginBottom: "1rem" }}>
          <Input
            label="Phone Number"
            name="phone"
            type="text"
            placeholder="+91 9876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <div className="eduos-hint">
            <p>
              Faculty &amp; Students: Enter the phone number registered on your
              profile. If you don&apos;t know it, contact your class teacher or
              admin office.
            </p>
          </div>
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Sending…" : "Send OTP"}
        </Button>

        <p style={{ textAlign: "center", marginTop: "1.25rem" }}>
          <a
            href={AUTH_ROUTES.login}
            style={{
              fontSize: "0.875rem",
              color: "var(--eduos-primary)",
            }}
          >
            ← Back to Login
          </a>
        </p>
      </form>
    </AuthCard>
  );
}

export { STORAGE_KEY as RESET_FLOW_STORAGE_KEY };
