"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import type { TenantLoginConfig } from "@eduos/types";
import { AUTH_ROUTES } from "@eduos/constants";
import { AuthCard, Button, Input, PasswordStrength, LoadingScreen } from "@eduos/ui";
import { RESET_FLOW_STORAGE_KEY } from "../page";

export default function NewPasswordPage() {
  const router = useRouter();
  const [config, setConfig] = useState<TenantLoginConfig | null>(null);
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch("/api/tenant-config")
      .then((r) => r.json())
      .then(setConfig);

    const raw = sessionStorage.getItem(RESET_FLOW_STORAGE_KEY);
    if (!raw) {
      router.replace(AUTH_ROUTES.forgotPassword);
      return;
    }
    const data = JSON.parse(raw) as { resetToken: string };
    setResetToken(data.resetToken);
  }, [router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 10) {
      setError("Password must be at least 10 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetToken, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Reset failed");

      sessionStorage.removeItem(RESET_FLOW_STORAGE_KEY);
      setSuccess(true);
      setTimeout(() => router.push(AUTH_ROUTES.login), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setIsLoading(false);
    }
  }

  if (!config) return <LoadingScreen />;

  return (
    <AuthCard
      institutionName={config.institution_name}
      logoUrl={config.logo_url}
      title="Set New Password"
    >
      {success ? (
        <div className="eduos-alert eduos-alert-info">
          Password updated successfully. Redirecting to login…
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {error ? (
            <div className="eduos-alert eduos-alert-error" style={{ marginBottom: "1rem" }}>
              {error}
            </div>
          ) : null}

          <div style={{ marginBottom: "1rem" }}>
            <Input
              label="New Password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <PasswordStrength password={password} />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <Input
              label="Confirm Password"
              name="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving…" : "Reset Password"}
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
