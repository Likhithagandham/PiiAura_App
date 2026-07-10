"use client";

import type { ReactNode } from "react";

interface TooltipProps {
  /** Tooltip text shown on hover/focus. */
  label: string;
  children: ReactNode;
  /** Preferred side; defaults to top. */
  side?: "top" | "bottom";
  className?: string;
}

/**
 * F-250 — lightweight CSS tooltip. The trigger must be focusable for keyboard
 * users; wrap inline content or icon buttons. For truncated table text prefer
 * {@link TruncatedText}, which also keeps the full value selectable.
 */
export function Tooltip({ label, children, side = "top", className = "" }: TooltipProps) {
  return (
    <span
      className={`eduos-tooltip eduos-tooltip--${side} ${className}`.trim()}
      tabIndex={0}
      data-tooltip={label}
      aria-label={label}
    >
      {children}
    </span>
  );
}

/**
 * F-250 — single-line text that truncates with an ellipsis and exposes the
 * full value via a native tooltip on hover. Reliable inside scrollable tables.
 */
export function TruncatedText({
  text,
  maxWidth,
  className = "",
}: {
  text: string;
  /** CSS max-width for the truncation box (e.g. "16rem"). */
  maxWidth?: string | number;
  className?: string;
}) {
  return (
    <span
      className={`eduos-truncate ${className}`.trim()}
      style={maxWidth ? { maxWidth } : undefined}
      title={text}
    >
      {text}
    </span>
  );
}
