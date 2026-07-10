"use client";

import Link from "next/link";
import { useState } from "react";
import { PLATFORM_OWNER_ROUTES } from "@eduos/constants";
import { Button } from "@eduos/ui";
import { usePlatformSupport } from "@/lib/platform-owner/support-context";

const INSTITUTION_ORIGIN =
  typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:3000`
    : "http://localhost:3000";

export function SupportModeBanner() {
  const { session, exitSupport } = usePlatformSupport();
  const [exiting, setExiting] = useState(false);

  if (!session) return null;

  async function handleExit() {
    setExiting(true);
    try {
      await exitSupport();
    } finally {
      setExiting(false);
    }
  }

  const portalUrl = `${INSTITUTION_ORIGIN}/login`;

  return (
    <div
      className="eduos-platform-support-banner"
      role="status"
      aria-live="polite"
      aria-label="Support mode active"
    >
      <div className="eduos-platform-support-banner__content">
        <span className="eduos-platform-support-banner__badge">Support mode</span>
        <span>
          Impersonating <strong>{session.tenantName}</strong> (
          <code>{session.tenantSubdomain}</code>) —{" "}
          {session.readOnly ? "read-only" : "full access"} since{" "}
          {new Date(session.enteredAt).toLocaleString()}
        </span>
      </div>
      <div className="eduos-platform-support-banner__actions">
        <a
          href={portalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="eduos-platform-support-banner__link"
        >
          Open institution portal ↗
        </a>
        <Link href={PLATFORM_OWNER_ROUTES.support} className="eduos-platform-support-banner__link">
          Manage
        </Link>
        <Button
          type="button"
          variant="secondary"
          className="eduos-admin-btn-sm eduos-platform-support-banner__exit"
          disabled={exiting}
          onClick={handleExit}
        >
          {exiting ? "Exiting…" : "Exit support mode"}
        </Button>
      </div>
    </div>
  );
}
