"use client";

import { useRef, useState, type FormEvent } from "react";
import { Button } from "../components/Button";
import { Input } from "../components/Input";

function EyeIcon({ off }: { off: boolean }) {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
      {off ? <path d="M3 3l18 18" /> : null}
    </svg>
  );
}

export interface LoginFormLabels {
  identifierPlaceholder: string;
  studentIdLabel: string;
  facultyIdLabel: string;
}

interface LoginFormProps {
  labels: LoginFormLabels;
  onSubmit: (identifier: string, password: string) => Promise<void>;
  /** Omit on consoles that do not support self-service password reset (e.g. platform owner). */
  forgotPasswordHref?: string;
  isLoading?: boolean;
  error?: string | null;
  /** Institution portal: show Parent/Admin vs Faculty vs Student help. Off for platform owner. */
  showRoleGuide?: boolean;
  /** Override identifier field label (e.g. "Phone number" for platform owner). */
  identifierLabel?: string;
}

export function LoginForm({
  labels,
  onSubmit,
  forgotPasswordHref,
  isLoading = false,
  error = null,
  showRoleGuide = true,
  identifierLabel: identifierLabelProp,
}: LoginFormProps) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  function readCredentials(form: HTMLFormElement) {
    const fd = new FormData(form);
    return {
      id: String(fd.get("identifier") ?? "").trim() || identifier.trim(),
      pwd: String(fd.get("password") ?? "") || password,
    };
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { id, pwd } = readCredentials(e.currentTarget);
    await onSubmit(id, pwd);
  }

  async function submitFromButton() {
    if (!formRef.current) return;
    const { id, pwd } = readCredentials(formRef.current);
    await onSubmit(id, pwd);
  }

  const identifierLabel =
    identifierLabelProp ??
    (showRoleGuide
      ? `Phone / ${labels.facultyIdLabel} / ${labels.studentIdLabel}`
      : "Phone number");

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate>
      {error ? (
        <div className="eduos-alert eduos-alert-error" style={{ marginBottom: "1rem" }} role="alert">
          {error}
        </div>
      ) : null}

      <div style={{ marginBottom: "1rem" }}>
        <Input
          label={identifierLabel}
          name="identifier"
          type="text"
          autoComplete="username"
          placeholder={labels.identifierPlaceholder}
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
        />
        {showRoleGuide ? (
          <div className="eduos-auth-role-guide" aria-label="Sign-in identifier help">
            <p className="eduos-auth-role-guide__title">Who are you signing in as?</p>
            <div className="eduos-auth-role-guide__row">
              <span className="eduos-auth-role-guide__role">Parent / Admin</span>
              <span>Phone number</span>
            </div>
            <div className="eduos-auth-role-guide__row">
              <span className="eduos-auth-role-guide__role">Faculty</span>
              <span>{labels.facultyIdLabel}</span>
            </div>
            <div className="eduos-auth-role-guide__row">
              <span className="eduos-auth-role-guide__role">Student</span>
              <span>{labels.studentIdLabel}</span>
            </div>
          </div>
        ) : null}
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <label htmlFor="password" className="eduos-label">
          Password
        </label>
        <div className="eduos-password-field">
          <input
            id="password"
            name="password"
            className="eduos-input eduos-input--with-toggle"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="eduos-password-toggle"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
          >
            <EyeIcon off={showPassword} />
          </button>
        </div>
      </div>

      <Button
        type="button"
        disabled={isLoading}
        style={{ width: "100%" }}
        onClick={() => void submitFromButton()}
      >
        {isLoading ? "Signing in…" : "Login"}
      </Button>

      {forgotPasswordHref ? (
        <p className="eduos-auth-forgot">
          <a href={forgotPasswordHref}>Forgot password?</a>
        </p>
      ) : null}
    </form>
  );
}
