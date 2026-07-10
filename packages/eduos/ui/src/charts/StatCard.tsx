"use client";

import type { ReactNode } from "react";

export interface StatCardProps {
  label: string;
  value: ReactNode;
  /** Small icon shown top-right in an accent-tinted badge. */
  icon?: ReactNode;
  /** Secondary line under the value (e.g. "183 / 201 students"). */
  sub?: ReactNode;
  /** Trend pill, e.g. { label: "+12% vs last month", direction: "up" }. */
  trend?: { label: string; direction?: "up" | "down" | "flat" };
  /** Accent color for the icon badge (defaults to brand). */
  accent?: string;
  /** Optional inline visual (sparkline, mini bar, meter) rendered at the bottom. */
  children?: ReactNode;
}

function TrendArrow({ direction }: { direction: "up" | "down" | "flat" }) {
  const d =
    direction === "down"
      ? "M6 9l6 6 6-6"
      : direction === "flat"
        ? "M5 12h14"
        : "M6 15l6-6 6 6";
  return (
    <svg width={12} height={12} viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

export function StatCard({ label, value, icon, sub, trend, accent, children }: StatCardProps) {
  const accentColor = accent ?? "var(--eduos-brand)";
  return (
    <article className="eduos-stat-card">
      <div className="eduos-stat-card__head">
        <span className="eduos-stat-card__label">{label}</span>
        {icon ? (
          <span
            className="eduos-stat-card__icon"
            style={{ color: accentColor, background: `color-mix(in srgb, ${accentColor} 12%, transparent)` }}
            aria-hidden
          >
            {icon}
          </span>
        ) : null}
      </div>
      <div className="eduos-stat-card__value">{value}</div>
      {sub ? <div className="eduos-stat-card__sub">{sub}</div> : null}
      {trend ? (
        <div className={`eduos-stat-card__trend eduos-stat-card__trend--${trend.direction ?? "flat"}`}>
          <TrendArrow direction={trend.direction ?? "flat"} />
          {trend.label}
        </div>
      ) : null}
      {children ? <div className="eduos-stat-card__viz">{children}</div> : null}
    </article>
  );
}
