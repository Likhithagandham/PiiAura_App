"use client";

import type { PortalAlert } from "@eduos/types";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { IconAlertTriangle } from "../icons/StatIcons";

const BANNER_SEVERITIES = new Set<PortalAlert["severity"]>(["warning", "critical"]);
const ROTATE_MS = 7000;

const ICON_COLOR: Record<"warning" | "critical", string> = {
  warning: "#d97706",
  critical: "#dc2626",
};

function AlertBannerIcon({ severity }: { severity: "warning" | "critical" }) {
  return <IconAlertTriangle size={20} color={ICON_COLOR[severity]} />;
}

function isNegativeAlert(alert: PortalAlert): alert is PortalAlert & { severity: "warning" | "critical" } {
  return BANNER_SEVERITIES.has(alert.severity as any);
}

function AlertBannerCard({ alert }: { alert: PortalAlert & { severity: "warning" | "critical" } }) {
  return (
    <div className={`eduos-alert-banner eduos-alert-banner--${alert.severity}`} role="alert">
      <span className="eduos-alert-banner__icon" aria-hidden="true">
        <AlertBannerIcon severity={alert.severity} />
      </span>
      <div className="eduos-alert-banner__body">
        <strong>
          {alert.title}
          {alert.count != null ? ` (${alert.count})` : ""}
        </strong>
        <span className="eduos-lead"> — {alert.message} </span>
        {alert.href ? (
          <Link href={alert.href} className="eduos-link eduos-alert-banner__action">
            {alert.actionLabel ?? "View details"}
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export function PortalAlertsBanners({
  apiUrl,
  refreshKey,
  alerts: alertsProp,
}: {
  apiUrl: string | null;
  refreshKey?: string | null;
  /**
   * Pre-fetched alerts (typically from a cached query in the host app's shell). When
   * provided, the banner uses these and does NOT fetch — avoiding a per-navigation
   * network call. When omitted, it self-fetches from `apiUrl` (legacy behaviour).
   */
  alerts?: PortalAlert[] | null;
}) {
  const [fetched, setFetched] = useState<PortalAlert[]>([]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // Host injects data → skip fetching entirely.
  const selfFetch = alertsProp === undefined;

  const load = useCallback(async (signal?: AbortSignal) => {
    if (!apiUrl) {
      setFetched([]);
      return;
    }
    const res = await fetch(apiUrl, { credentials: "include", signal });
    if (signal?.aborted) return;
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setFetched([]);
      return;
    }
    setFetched((json as { alerts: PortalAlert[] }).alerts ?? []);
  }, [apiUrl]);

  useEffect(() => {
    if (!selfFetch) return;
    const controller = new AbortController();
    void load(controller.signal).catch((e: unknown) => {
      if ((e as Error).name !== "AbortError") setFetched([]);
    });
    return () => controller.abort();
  }, [load, refreshKey, selfFetch]);

  const alerts = (alertsProp ?? fetched).filter(isNegativeAlert);

  useEffect(() => {
    setIndex(0);
  }, [alerts.length, refreshKey]);

  useEffect(() => {
    if (alerts.length <= 1 || paused) return;
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % alerts.length);
    }, ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [alerts.length, paused]);

  if (alerts.length === 0) return null;

  const current = alerts[index]!;

  return (
    <div
      className="eduos-alert-carousel"
      role="region"
      aria-label={
        alerts.length > 1
          ? `Active alerts, showing ${index + 1} of ${alerts.length}`
          : "Active alerts"
      }
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="eduos-alert-carousel__viewport" aria-live="polite">
        <div
          className="eduos-alert-carousel__track"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {alerts.map((a) => (
            <div key={a.id} className="eduos-alert-carousel__slide" aria-hidden={a.id !== current.id}>
              <AlertBannerCard alert={a} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
