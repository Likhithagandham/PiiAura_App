"use client";

import type { PortalAlert } from "@eduos/types";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { EmptyState } from "./EmptyState";
import { SkeletonText } from "./Skeleton";

const SEVERITY_LABEL: Record<PortalAlert["severity"], string> = {
  info: "Info",
  warning: "Warning",
  critical: "Critical",
};

export function AlertsInboxPanel({
  apiUrl,
  title = "Active alerts",
  emptyTitle = "No alerts",
  emptyDescription = "There are no active alerts right now.",
}: {
  apiUrl: string;
  title?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  const [alerts, setAlerts] = useState<PortalAlert[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const res = await fetch(apiUrl, { credentials: "include" });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError((json as { error?: string }).error ?? "Failed to load alerts");
      return;
    }
    setAlerts((json as { alerts: PortalAlert[] }).alerts ?? []);
  }, [apiUrl]);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return <p className="eduos-admin-message eduos-admin-message--error">{error}</p>;
  }

  if (!alerts) {
    return <SkeletonText lines={4} />;
  }

  if (alerts.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <section className="eduos-panel">
      <h2 className="eduos-section-title">{title}</h2>
      <div className="eduos-alerts-inbox">
        {alerts.map((a) => (
          <article key={a.id} className={`eduos-alert-card eduos-alert-card--${a.severity}`}>
            <div className="eduos-alert-card__head">
              <div className="eduos-alert-card__title">{a.title}</div>
              <span className={`eduos-alert-card__severity eduos-alert-card__severity--${a.severity}`}>
                {SEVERITY_LABEL[a.severity]}
                {a.count != null ? ` · ${a.count}` : ""}
              </span>
            </div>
            <p className="eduos-alert-card__message">{a.message}</p>
            <div className="eduos-alert-card__meta">
              <time dateTime={a.createdAt}>{new Date(a.createdAt).toLocaleString()}</time>
              {a.href ? (
                <Link href={a.href} className="eduos-link">
                  {a.actionLabel ?? "View details"}
                </Link>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
