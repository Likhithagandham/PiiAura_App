"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { TenantLoginConfig } from "@eduos/types";
import { AUTH_ROUTES } from "@eduos/constants";
import { AuthCard, Button, Input, LoadingScreen } from "@eduos/ui";

export default function ResetPasswordPage() {
  const [config, setConfig] = useState<TenantLoginConfig | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch("/api/tenant-config")
      .then((r) => r.json())
      .then(setConfig)
      .catch(() => null);
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword === currentPassword) {
      setError("New password must be different from your current password");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Password change failed");

      setSuccess(true);
      setTimeout(
        () => (window.location.href = `${AUTH_ROUTES.login}?changed=1`),
        2000,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Password change failed");
    } finally {
      setIsLoading(false);
    }
  }

  if (!config) return <LoadingScreen />;

  return (
    <AuthCard
      institutionName={config.institution_name}
      logoUrl={config.logo_url}
      title="Create a New Password"
    >
      <p className="eduos-auth-subtitle">
        You must set a new password before continuing.
      </p>

      {success ? (
        <div className="eduos-alert eduos-alert-success">
          Password updated successfully. Redirecting to login…
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="eduos-alert eduos-alert-error" role="alert">
              {error}
            </div>
          )}

          <Input
            label="Current (temporary) password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          <Input
            label="New password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            required
          />

          <Input
            label="Confirm new password"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            required
          />

          <Button type="submit" disabled={isLoading} className="w-full mt-4">
            {isLoading ? "Saving…" : "Set New Password"}
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
