import type { ReactNode } from "react";

interface EmptyStateProps {
  /** Short headline describing the empty result. */
  title: string;
  /** Optional supporting text. */
  description?: ReactNode;
  /** Optional icon/illustration rendered above the title. */
  icon?: ReactNode;
  /** Optional call-to-action (e.g. a Button) prompting the next step. */
  action?: ReactNode;
  /** Compact variant for inline/table contexts. */
  compact?: boolean;
  className?: string;
}

/**
 * F-245 — consistent empty state for tables, charts and lists, always with
 * room for an action prompt.
 */
export function EmptyState({
  title,
  description,
  icon,
  action,
  compact = false,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`eduos-empty-state${compact ? " eduos-empty-state--compact" : ""} ${className}`.trim()}
      role="status"
    >
      {icon ? <div className="eduos-empty-state__icon" aria-hidden>{icon}</div> : null}
      <p className="eduos-empty-state__title">{title}</p>
      {description ? <p className="eduos-empty-state__desc">{description}</p> : null}
      {action ? <div className="eduos-empty-state__action">{action}</div> : null}
    </div>
  );
}
