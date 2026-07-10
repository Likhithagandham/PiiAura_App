import type { CSSProperties } from "react";

type SkeletonVariant = "text" | "line" | "block" | "circle";

interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  radius?: string | number;
  className?: string;
  style?: CSSProperties;
}

/** F-246 — single shimmer placeholder block. */
export function Skeleton({
  variant = "line",
  width,
  height,
  radius,
  className = "",
  style,
}: SkeletonProps) {
  const resolved: CSSProperties = {
    width,
    height,
    borderRadius: radius ?? (variant === "circle" ? "50%" : undefined),
    ...style,
  };
  return (
    <span
      aria-hidden
      className={`eduos-skeleton eduos-skeleton--${variant} ${className}`.trim()}
      style={resolved}
    />
  );
}

/** F-246 — stacked text lines; the last line is shortened for realism. */
export function SkeletonText({
  lines = 3,
  className = "",
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <span className={`eduos-skeleton-text ${className}`.trim()} aria-hidden>
      {Array.from({ length: Math.max(1, lines) }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 && lines > 1 ? "60%" : "100%"}
        />
      ))}
    </span>
  );
}

/**
 * F-246 — table-shaped skeleton for async tables. Renders inside a wrapper
 * that matches the `eduos-admin-table` layout.
 */
export function SkeletonTable({
  rows = 5,
  columns = 4,
  label = "Loading…",
}: {
  rows?: number;
  columns?: number;
  label?: string;
}) {
  return (
    <div className="eduos-skeleton-table" role="status" aria-busy="true" aria-label={label}>
      <div className="eduos-skeleton-table__head">
        {Array.from({ length: columns }).map((_, c) => (
          <Skeleton key={c} variant="text" width="70%" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="eduos-skeleton-table__row">
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton key={c} variant="text" width={c === 0 ? "85%" : "55%"} />
          ))}
        </div>
      ))}
      <span className="eduos-visually-hidden">{label}</span>
    </div>
  );
}
