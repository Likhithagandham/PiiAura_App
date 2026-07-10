"use client";

import { Button } from "./Button";
import { Modal } from "./Modal";

interface SessionTimeoutModalProps {
  secondsLeft: number;
  /** "Stay logged in" handler. */
  onStay: () => void;
  /** Log out now handler. */
  onLogout: () => void;
  /** Disables actions while a refresh is in flight. */
  busy?: boolean;
}

function formatCountdown(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

/** F-247 — session expiry warning shown at T-2 minutes. */
export function SessionTimeoutModal({
  secondsLeft,
  onStay,
  onLogout,
  busy = false,
}: SessionTimeoutModalProps) {
  return (
    <Modal
      title="Still there?"
      footer={
        <>
          <Button variant="secondary" onClick={onLogout} disabled={busy}>
            Log out
          </Button>
          <Button onClick={onStay} disabled={busy}>
            {busy ? "Staying…" : "Stay logged in"}
          </Button>
        </>
      }
    >
      <p style={{ margin: 0 }}>
        Your session will expire in{" "}
        <strong>{formatCountdown(secondsLeft)}</strong> due to inactivity. Choose
        “Stay logged in” to continue.
      </p>
    </Modal>
  );
}
