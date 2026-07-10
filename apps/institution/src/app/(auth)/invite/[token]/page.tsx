"use client";

import { use, useEffect, useState, type FormEvent } from "react";
import { getDashboardPath } from "@eduos/hooks";
import type { TenantLoginConfig } from "@eduos/types";
import { AuthCard, Button, Input, PasswordStrength, LoadingScreen } from "@eduos/ui";

export default function InviteAcceptPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);

  const [config, setConfig] = useState<TenantLoginConfig | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch("/api/tenant-config")
      .then((r) => r.json())
      .then(setConfig)
      .catch(() => null);
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/invite/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json() as { type?: string; user?: { role: string }; error?: string };

      if (!res.ok || data.type !== "success") {
        throw new Error(data.error ?? "Failed to activate account.");
      }

      setDone(true);
      const role = data.user?.role ?? "";
      window.location.assign(getDashboardPath(role as Parameters<typeof getDashboardPath>[0]));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  if (!config) return <LoadingScreen />;

  return (
    <AuthCard
      institutionName={config.institution_name}
      logoUrl={config.logo_url}
      title="Set Your Password"
    >
      {done ? (
        <div className="eduos-alert eduos-alert-info">
          Account activated! Redirecting…
        </div>
      ) : (
        <>
          <p style={{ marginBottom: "1.25rem", color: "var(--color-text-secondary)", fontSize: "0.9rem" }}>
            Welcome to {config.institution_name}. Create a secure password to get started.
          </p>

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
                autoFocus
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
              {isLoading ? "Activating…" : "Activate Account"}
            </Button>
          </form>
        </>
      )}
    </AuthCard>
  );
}
