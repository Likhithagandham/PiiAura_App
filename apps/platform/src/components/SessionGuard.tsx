"use client";

import { useState } from "react";
import { useAuth, useSessionTimeout } from "@eduos/hooks";
import { SessionTimeoutModal } from "@eduos/ui";

/** F-247 — mounts the inactivity warning for the platform owner portal. */
export function SessionGuard() {
  const { user, logout, refreshUser } = useAuth();
  const [busy, setBusy] = useState(false);

  const { warning, secondsLeft, stayActive } = useSessionTimeout({
    enabled: Boolean(user),
    onExpire: () => {
      void logout();
    },
  });

  async function handleStay() {
    setBusy(true);
    try {
      await fetch("/api/auth/refresh", { method: "POST", credentials: "include" });
      await refreshUser();
    } catch {
      /* keep the user on the page even if refresh fails; next request will gate */
    } finally {
      stayActive();
      setBusy(false);
    }
  }

  if (!user || !warning) return null;

  return (
    <SessionTimeoutModal
      secondsLeft={secondsLeft}
      onStay={handleStay}
      onLogout={() => {
        void logout();
      }}
      busy={busy}
    />
  );
}
