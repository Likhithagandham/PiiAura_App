"use client";

import { useEffect } from "react";

const DEFAULT_MESSAGE =
  "You have unsaved changes. Are you sure you want to leave this page?";

interface UnsavedChangesGuardOptions {
  /** When true, guards are armed. Pass your form's dirty flag here. */
  when: boolean;
  /** Confirmation copy for back-navigation. */
  message?: string;
}

/**
 * F-248 + F-249 — warns before the user loses unsaved form changes.
 *
 * - F-248: native `beforeunload` prompt on tab close / reload / external nav.
 * - F-249: a confirm() prompt when the user presses the browser Back button.
 *   Implemented by pinning a sentinel history entry while dirty and re-pinning
 *   it if the user cancels the back navigation.
 */
export function useUnsavedChangesGuard({
  when,
  message = DEFAULT_MESSAGE,
}: UnsavedChangesGuardOptions): void {
  useEffect(() => {
    if (!when) return;

    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      // Required for Chrome to show the native dialog.
      e.returnValue = "";
      return "";
    }

    // Pin a sentinel entry so the first Back press stays on this page,
    // giving us a chance to confirm.
    window.history.pushState(null, "", window.location.href);

    function handlePopState() {
      const leave = window.confirm(message);
      if (!leave) {
        // User cancelled: re-pin the sentinel to keep them on the page.
        window.history.pushState(null, "", window.location.href);
      } else {
        // User confirmed: actually go back past the sentinel.
        window.removeEventListener("popstate", handlePopState);
        window.history.back();
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [when, message]);
}
