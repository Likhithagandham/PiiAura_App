"use client";

import { useCallback, useEffect, useState } from "react";
import type { DisambiguationAccount, TenantLoginConfig } from "@eduos/types";
import { AUTH_ROUTES } from "@eduos/constants";
import { AuthCard, LoginForm, OtpInput, RolePickerModal } from "@eduos/ui";
import { getDashboardPath, useAuth } from "@eduos/hooks";

interface LoginPageClientProps {
  initialConfig: TenantLoginConfig;
}

function goToDashboard(role: Parameters<typeof getDashboardPath>[0]) {
  window.location.assign(getDashboardPath(role));
}

export function LoginPageClient({ initialConfig }: LoginPageClientProps) {
  const { login, completeDisambiguation, user, isLoading: authLoading, refreshUser } =
    useAuth();
  const [config] = useState<TenantLoginConfig>(initialConfig);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [disambiguation, setDisambiguation] = useState<{
    token: string;
    accounts: DisambiguationAccount[];
    password: string;
  } | null>(null);
  const [mfaChallenge, setMfaChallenge] = useState<{
    mfaSessionToken: string;
    emailHint: string;
  } | null>(null);
  const [otp, setOtp] = useState("");

  useEffect(() => {
    if (authLoading || disambiguation || mfaChallenge) return;
    if (user) {
      goToDashboard(user.role);
    }
  }, [authLoading, user, disambiguation, mfaChallenge]);

  const handleLogin = useCallback(
    async (identifier: string, password: string) => {
      setError(null);
      setIsSubmitting(true);
      try {
        const result = await login(identifier, password);
        if (result.type === "success") {
          await refreshUser();
          goToDashboard(result.user.role);
          return;
        }
        if (result.type === "force_change_password") {
          window.location.assign(AUTH_ROUTES.changePassword);
          return;
        }
        if (result.type === "mfa_required") {
          setMfaChallenge({
            mfaSessionToken: result.mfaSessionToken,
            emailHint: result.emailHint,
          });
          return;
        }
        setDisambiguation({
          token: result.token,
          accounts: result.accounts,
          password,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Invalid credentials");
      } finally {
        setIsSubmitting(false);
      }
    },
    [login, refreshUser],
  );

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
      if (data.user) goToDashboard(data.user.role as Parameters<typeof getDashboardPath>[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setIsSubmitting(false);
    }
  }, [mfaChallenge, otp, refreshUser]);

  const handleDisambiguation = useCallback(
    async (userId: string) => {
      if (!disambiguation) return;
      setIsSubmitting(true);
      setError(null);
      try {
        const loggedInUser = await completeDisambiguation(
          disambiguation.token,
          userId,
          disambiguation.password,
        );
        if (loggedInUser.mustChangePassword) {
          window.location.assign(AUTH_ROUTES.changePassword);
          return;
        }
        await refreshUser();
        goToDashboard(loggedInUser.role);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Invalid credentials");
        setIsSubmitting(false);
      }
    },
    [disambiguation, completeDisambiguation, refreshUser],
  );

  const identifierPlaceholder = `Phone / ${config.faculty_id_label} / ${config.student_id_label}`;

  if (mfaChallenge) {
    return (
      <AuthCard
        institutionName={config.institution_name}
        logoUrl={config.logo_url}
        title="Two-step verification"
      >
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
          className="eduos-btn eduos-btn-primary"
          style={{ width: "100%", marginTop: "1.25rem" }}
          disabled={otp.length < 6 || isSubmitting}
          onClick={handleMfaVerify}
        >
          {isSubmitting ? "Verifying…" : "Verify"}
        </button>
        <button
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
    <>
      <AuthCard
        institutionName={config.institution_name}
        logoUrl={config.logo_url}
        title="Login"
      >
        <LoginForm
          labels={{
            identifierPlaceholder,
            studentIdLabel: config.student_id_label,
            facultyIdLabel: config.faculty_id_label,
          }}
          forgotPasswordHref={AUTH_ROUTES.forgotPassword}
          onSubmit={handleLogin}
          isLoading={isSubmitting && !disambiguation}
          error={disambiguation ? null : error}
        />
      </AuthCard>

      {disambiguation ? (
        <RolePickerModal
          description="Multiple accounts found for this identifier. Select which account to log into:"
          accounts={disambiguation.accounts}
          onContinue={handleDisambiguation}
          isLoading={isSubmitting}
          error={error}
        />
      ) : null}
    </>
  );
}
