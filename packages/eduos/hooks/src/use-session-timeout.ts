"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Default idle window before the session is considered expired (15 min, matches access token). */
export const SESSION_IDLE_MS = 15 * 60 * 1000;
/** Show the warning this long before expiry (T-2 minutes). */
export const SESSION_WARN_BEFORE_MS = 2 * 60 * 1000;

const ACTIVITY_EVENTS = ["mousedown", "keydown", "scroll", "touchstart"] as const;

interface SessionTimeoutOptions {
  /** Only arm timers when there is an authenticated user. */
  enabled: boolean;
  idleMs?: number;
  warnBeforeMs?: number;
  /** Called when the idle window fully elapses (typically logout). */
  onExpire: () => void;
}

interface SessionTimeoutState {
  /** True while inside the warning window (drives the modal). */
  warning: boolean;
  /** Whole seconds remaining until expiry while warning is shown. */
  secondsLeft: number;
  /** "Stay logged in": resets the idle window. */
  stayActive: () => void;
}

/**
 * F-247 — idle session timeout. Resets on user activity until the warning
 * window opens; inside the window only an explicit `stayActive()` keeps the
 * session, otherwise `onExpire` fires.
 */
export function useSessionTimeout({
  enabled,
  idleMs = SESSION_IDLE_MS,
  warnBeforeMs = SESSION_WARN_BEFORE_MS,
  onExpire,
}: SessionTimeoutOptions): SessionTimeoutState {
  const [warning, setWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(Math.ceil(warnBeforeMs / 1000));
  const deadlineRef = useRef<number>(Date.now() + idleMs);
  const warningRef = useRef(false);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  const reset = useCallback(() => {
    deadlineRef.current = Date.now() + idleMs;
    warningRef.current = false;
    setWarning(false);
  }, [idleMs]);

  const stayActive = useCallback(() => {
    reset();
  }, [reset]);

  useEffect(() => {
    if (!enabled) return;

    reset();

    function onActivity() {
      // Activity only refreshes the window before the warning appears; once
      // the modal is up, the user must explicitly choose to stay.
      if (!warningRef.current) {
        deadlineRef.current = Date.now() + idleMs;
      }
    }

    ACTIVITY_EVENTS.forEach((evt) =>
      window.addEventListener(evt, onActivity, { passive: true }),
    );

    const interval = window.setInterval(() => {
      const remaining = deadlineRef.current - Date.now();
      if (remaining <= 0) {
        warningRef.current = false;
        setWarning(false);
        onExpireRef.current();
        return;
      }
      if (remaining <= warnBeforeMs) {
        warningRef.current = true;
        setWarning(true);
        setSecondsLeft(Math.ceil(remaining / 1000));
      } else if (warningRef.current) {
        warningRef.current = false;
        setWarning(false);
      }
    }, 1000);

    return () => {
      window.clearInterval(interval);
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, onActivity));
    };
  }, [enabled, idleMs, warnBeforeMs, reset]);

  return { warning, secondsLeft, stayActive };
}
