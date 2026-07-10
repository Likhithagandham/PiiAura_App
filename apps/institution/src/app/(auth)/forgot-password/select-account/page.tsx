"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { DisambiguationAccount, TenantLoginConfig } from "@eduos/types";
import { AUTH_ROUTES } from "@eduos/constants";
import { AccountPicker, AuthCard, LoadingScreen } from "@eduos/ui";
import { RESET_FLOW_STORAGE_KEY } from "../page";

export default function ForgotPasswordSelectAccountPage() {
  const router = useRouter();
  const [config, setConfig] = useState<TenantLoginConfig | null>(null);
  const [accounts, setAccounts] = useState<DisambiguationAccount[]>([]);
  const [selectionToken, setSelectionToken] = useState("");
  const [error, setError] = useState<string | null>(null);
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
    const data = JSON.parse(raw) as {
      selectionToken: string;
      accounts: DisambiguationAccount[];
    };
    setSelectionToken(data.selectionToken);
    setAccounts(data.accounts);
  }, [router]);

  async function handleContinue(userId: string) {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/password-reset/select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectionToken, userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");

      sessionStorage.setItem(
        RESET_FLOW_STORAGE_KEY,
        JSON.stringify({ otpToken: data.otpToken }),
      );
      router.push(AUTH_ROUTES.forgotPasswordVerifyOtp);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setIsLoading(false);
    }
  }

  if (!config || accounts.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <AuthCard
      institutionName={config.institution_name}
      logoUrl={config.logo_url}
      title="Select Account to Reset"
    >
      {error ? (
        <div className="eduos-alert eduos-alert-error" style={{ marginBottom: "1rem" }}>
          {error}
        </div>
      ) : null}
      <AccountPicker
        title="Select Account to Reset"
        description="This phone number is linked to multiple accounts. Which password do you want to reset?"
        accounts={accounts}
        onContinue={handleContinue}
        isLoading={isLoading}
      />
    </AuthCard>
  );
}
