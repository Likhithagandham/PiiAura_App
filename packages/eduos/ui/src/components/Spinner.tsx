import type { CSSProperties } from "react";

export type SpinnerSize = "sm" | "md" | "lg";

const SIZE_PX: Record<SpinnerSize, number> = {
  sm: 20,
  md: 32,
  lg: 48,
};

export interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
  style?: CSSProperties;
  label?: string;
}

/** Branded circular loading indicator. */
export function Spinner({ size = "md", className = "", style, label = "Loading" }: SpinnerProps) {
  const px = SIZE_PX[size];
  return (
    <span
      className={`eduos-spinner eduos-spinner--size-${size} ${className}`.trim()}
      style={{ width: px, height: px, ...style }}
      role="status"
      aria-label={label}
    />
  );
}

/** Centered spinner for panels, pages, and async content areas. */
export function InlineLoading({
  size = "md",
  className = "",
  minHeight = "6rem",
}: {
  size?: SpinnerSize;
  className?: string;
  minHeight?: string | number;
}) {
  return (
    <div
      className={`eduos-inline-loading ${className}`.trim()}
      style={{ minHeight }}
      role="status"
      aria-busy="true"
    >
      <Spinner size={size} />
    </div>
  );
}
