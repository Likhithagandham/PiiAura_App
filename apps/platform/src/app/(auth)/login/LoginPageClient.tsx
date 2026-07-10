"use client";

import { useCallback, useEffect, useState } from "react";
import { AuthCard, OtpInput } from "@eduos/ui";
import { getDashboardPath, useAuth } from "@eduos/hooks";

export function LoginPageClient() {
  const { login, user, isLoading: authLoading, refreshUser, logout } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mfaChallenge, setMfaChallenge] = useState<{
    mfaSessionToken: string;
    emailHint: string;
  } | null>(null);
  const [otp, setOtp] = useState("");

  useEffect(() => {
    if (authLoading || mfaChallenge) return;
    if (!user) return;
    if (user.role === "platform_owner") {
      window.location.assign(getDashboardPath(user.role));
      return;
    }
    void logout();
  }, [authLoading, user, logout, mfaChallenge]);

  const handleLogin = useCallback(async () => {
    const id = identifier.trim();
    const pwd = password;
    if (!id || !pwd) {
      setError("Enter your phone number and password.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await login(id, pwd);
      if (result.type === "success") {
        await refreshUser();
        window.location.assign(getDashboardPath(result.user.role));
        return;
      }
      if (result.type === "mfa_required") {
        setMfaChallenge({
          mfaSessionToken: result.mfaSessionToken,
          emailHint: result.emailHint,
        });
        return;
      }
      setError("Multiple accounts are not supported on the platform console.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid credentials");
    } finally {
      setIsSubmitting(false);
    }
  }, [identifier, password, login, refreshUser]);

  const handleMfaVerify = useCallback(async () => {
    if (!mfaChallenge || otp.length < 6) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/mfa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ mfaSessionToken: mfaChallenge.mfaSessionToken, otp }),
      });
      const data = (await res.json()) as { type?: string; user?: { role: string }; error?: string };
      if (!res.ok || data.type !== "success") {
        setError(data.error ?? "Invalid verification code.");
        return;
      }
      await refreshUser();
      window.location.assign(getDashboardPath("platform_owner"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setIsSubmitting(false);
    }
  }, [mfaChallenge, otp, refreshUser]);

  if (mfaChallenge) {
    return (
      <AuthCard institutionName="PiiAura Platform" logoUrl={null} title="Two-step verification">
        <p style={{ marginBottom: "1.25rem", fontSize: "0.875rem", textAlign: "center" }}>
          A 6-digit code was sent to <strong>{mfaChallenge.emailHint}</strong>.
          Enter it below to complete sign-in.
        </p>
        <OtpInput value={otp} onChange={setOtp} disabled={isSubmitting} />
        {error && (
          <p style={{ color: "var(--color-error)", marginTop: "0.75rem", textAlign: "center", fontSize: "0.875rem" }}>
            {error}
          </p>
        )}
        <button
          type="button"
          className="eduos-btn eduos-btn-primary"
          style={{ width: "100%", marginTop: "1.25rem" }}
          disabled={otp.length < 6 || isSubmitting}
          onClick={() => void handleMfaVerify()}
        >
          {isSubmitting ? "Verifying…" : "Verify"}
        </button>
        <button
          type="button"
          className="eduos-btn eduos-btn-ghost"
          style={{ width: "100%", marginTop: "0.5rem", fontSize: "0.875rem" }}
          onClick={() => { setMfaChallenge(null); setOtp(""); setError(null); }}
        >
          Back to login
        </button>
      </AuthCard>
    );
  }

  return (
    <AuthCard institutionName="PiiAura Platform" logoUrl={null} title="Platform owner sign-in">
      <p className="eduos-auth-hint" style={{ marginBottom: "1rem", fontSize: "0.875rem" }}>
        Sign in with your platform owner phone number. This console is separate from institution
        portals (admin, faculty, student, parent).
      </p>

      {error ? (
        <div className="eduos-alert eduos-alert-error" style={{ marginBottom: "1rem" }} role="alert">
          {error}
        </div>
      ) : null}

      <div style={{ marginBottom: "1rem" }}>
        <label htmlFor="platform-login-phone" className="eduos-label">
          Phone number
        </label>
        <input
          id="platform-login-phone"
          className="eduos-input"
          type="text"
          autoComplete="username"
          placeholder="+91XXXXXXXXXX"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void handleLogin();
          }}
        />
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <label htmlFor="platform-login-password" className="eduos-label">
          Password
        </label>
        <input
          id="platform-login-password"
          className="eduos-input"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void handleLogin();
          }}
        />
      </div>

      <button
        type="button"
        className="eduos-btn eduos-btn-primary"
        style={{ width: "100%" }}
        disabled={isSubmitting}
        onClick={() => void handleLogin()}
      >
        {isSubmitting ? "Signing in…" : "Login"}
      </button>
    </AuthCard>
  );
}
