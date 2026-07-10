"use client";

import type { ReactNode } from "react";

/** Shared categorical palette — brand green first, then complementary hues. */
export const CHART_COLORS = [
  "#1a5f4a",
  "#2563eb",
  "#d69e2e",
  "#7c3aed",
  "#0891b2",
  "#dc2626",
  "#db2777",
  "#65a30d",
] as const;

export function chartColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}

/* ----------------------------- ProgressRing ----------------------------- */

export interface ProgressRingProps {
  percent: number;
  size?: number;
  thickness?: number;
  color?: string;
  track?: string;
  /** Big label inside the ring (defaults to "NN%"). */
  label?: ReactNode;
  /** Small caption under the label. */
  caption?: ReactNode;
}

export function ProgressRing({
  percent,
  size = 144,
  thickness = 10,
  color = "var(--eduos-primary)",
  track = "var(--eduos-accent-blue)",
  label,
  caption,
}: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, percent));
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c - (clamped / 100) * c;
  return (
    <div className="eduos-ring" style={{ width: size, height: size }} aria-label={`${clamped}%`}>
      <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden>
        <circle cx="60" cy="60" r={r} fill="none" stroke={track} strokeWidth={thickness} />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform="rotate(-90 60 60)"
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <div className="eduos-ring__label">
        {label ?? `${Math.round(clamped)}%`}
        {caption ? <small>{caption}</small> : null}
      </div>
    </div>
  );
}

/* ------------------------------ DonutChart ------------------------------ */

export interface DonutDatum {
  label: string;
  value: number;
  color?: string;
}

export interface DonutChartProps {
  data: DonutDatum[];
  size?: number;
  thickness?: number;
  centerValue?: ReactNode;
  centerLabel?: ReactNode;
}

export function DonutChart({ data, size = 160, thickness = 20, centerValue, centerLabel }: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + Math.max(0, d.value), 0);
  const r = (120 - thickness) / 2;
  const c = 2 * Math.PI * r;
  let acc = 0;

  return (
    <div className="eduos-donut" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden>
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--eduos-border)" strokeWidth={thickness} opacity={total > 0 ? 0.5 : 1} />
        {total > 0
          ? data.map((d, i) => {
              const value = Math.max(0, d.value);
              if (value <= 0) return null;
              const len = (value / total) * c;
              const seg = (
                <circle
                  key={d.label}
                  cx="60"
                  cy="60"
                  r={r}
                  fill="none"
                  stroke={d.color ?? chartColor(i)}
                  strokeWidth={thickness}
                  strokeDasharray={`${len} ${c - len}`}
                  strokeDashoffset={-acc}
                  transform="rotate(-90 60 60)"
                  style={{ transition: "stroke-dasharray 0.5s ease" }}
                />
              );
              acc += len;
              return seg;
            })
          : null}
      </svg>
      {centerValue != null || centerLabel != null ? (
        <div className="eduos-donut__center">
          {centerValue != null ? <span className="eduos-donut__value">{centerValue}</span> : null}
          {centerLabel != null ? <span className="eduos-donut__label">{centerLabel}</span> : null}
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------------- BarChart ------------------------------- */

export interface BarDatum {
  label: string;
  value: number;
  color?: string;
  /** Override the text shown above the bar (defaults to the value). */
  valueLabel?: ReactNode;
}

export interface BarChartProps {
  data: BarDatum[];
  height?: number;
  color?: string;
}

export function BarChart({ data, height = 180, color = "var(--eduos-primary)" }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="eduos-bars" style={{ height }}>
      {data.map((d, i) => {
        const pct = Math.max(0, (d.value / max) * 100);
        return (
          <div key={`${d.label}-${i}`} className="eduos-bars__col">
            <span className="eduos-bars__value">{d.valueLabel ?? d.value}</span>
            <div className="eduos-bars__track">
              <div
                className="eduos-bars__fill"
                style={{ height: `${pct}%`, background: d.color ?? color }}
                title={`${d.label}: ${d.value}`}
              />
            </div>
            <span className="eduos-bars__label">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------- Sparkline ------------------------------ */

export interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fill?: boolean;
}

export function Sparkline({ data, width = 120, height = 36, color = "var(--eduos-primary)", fill = true }: SparklineProps) {
  if (data.length === 0) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const stepX = data.length > 1 ? width / (data.length - 1) : 0;
  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return [x, y] as const;
  });
  const line = points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `0,${height} ${line} ${width},${height}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden className="eduos-sparkline">
      {fill ? <polygon points={area} fill={color} opacity={0.12} /> : null}
      <polyline points={line} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ----------------------------- ProgressMeter ---------------------------- */

export interface ProgressMeterProps {
  label: ReactNode;
  value: number;
  max?: number;
  valueLabel?: ReactNode;
  color?: string;
}

export function ProgressMeter({ label, value, max = 100, valueLabel, color = "var(--eduos-primary)" }: ProgressMeterProps) {
  const pct = Math.max(0, Math.min(100, (value / (max || 1)) * 100));
  return (
    <div className="eduos-meter">
      <span className="eduos-meter__label">{label}</span>
      <div className="eduos-meter__track">
        <div className="eduos-meter__fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="eduos-meter__value">{valueLabel ?? value}</span>
    </div>
  );
}

/* ------------------------------ ChartLegend ----------------------------- */

export interface LegendItem {
  label: ReactNode;
  color: string;
  value?: ReactNode;
}

export function ChartLegend({ items }: { items: LegendItem[] }) {
  return (
    <ul className="eduos-legend">
      {items.map((item, i) => (
        <li key={i} className="eduos-legend__item">
          <span className="eduos-legend__swatch" style={{ background: item.color }} aria-hidden />
          <span className="eduos-legend__label">{item.label}</span>
          {item.value != null ? <span className="eduos-legend__value">{item.value}</span> : null}
        </li>
      ))}
    </ul>
  );
}
