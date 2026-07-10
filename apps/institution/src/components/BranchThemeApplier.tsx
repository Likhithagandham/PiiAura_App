"use client";

import { useAuth } from "@eduos/hooks";
import { useEffect } from "react";

/**
 * Re-themes the authed app with the logged-in user's *branch* brand, layered over
 * the tenant theme that the root layout injected server-side.
 *
 * The user's resolved branch theme (override → tenant fallback) arrives on the auth
 * profile (`/auth/me`). We apply it as inline CSS variables on <html>, which inherit
 * to every descendant and win over the stylesheet defaults. Renders nothing.
 */

const HEX = /^#[0-9a-fA-F]{6}$/;

const PRIMARY_VARS = [
  "--eduos-brand",
  "--eduos-primary",
  "--eduos-primary-hover",
  "--eduos-border-focus",
  "--eduos-nav-active-border",
  "--eduos-kpi-value",
  "--eduos-trend",
];

export function BranchThemeApplier() {
  const { user } = useAuth();
  const primary = user?.branchTheme?.primaryColor;
  const accent = user?.branchTheme?.accentColor;

  useEffect(() => {
    const root = document.documentElement;
    if (primary && HEX.test(primary)) {
      for (const name of PRIMARY_VARS) root.style.setProperty(name, primary);
    }
    if (accent && HEX.test(accent)) {
      root.style.setProperty("--eduos-accent", accent);
    }
  }, [primary, accent]);

  return null;
}
