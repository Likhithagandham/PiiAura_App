/** Compact KPI card — same typography/colors as dashboard KPI row */

import type { ReactNode } from "react";

interface AdminStatCardProps {
  label: string;
  value: string;
  sub?: string;
  className?: string;
}

export function AdminStatCard({ label, value, sub, className }: AdminStatCardProps) {
  return (
    <article className={`eduos-kpi eduos-kpi--compact${className ? ` ${className}` : ""}`}>
      <div className="eduos-kpi__label">{label}</div>
      <div className="eduos-kpi__value">{value}</div>
      {sub ? <div className="eduos-kpi__sub">{sub}</div> : null}
    </article>
  );
}

export function AdminStatGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={`eduos-admin-stat-grid${className ? ` ${className}` : ""}`}>{children}</div>
  );
}
