import type { ReactNode } from "react";

interface LicensePaywallProps {
  /** e.g. "Gallery" — shown in the heading. Omit for a generic message. */
  moduleName?: string;
  /** Extra action(s), e.g. a link back to the dashboard or fees page. */
  action?: ReactNode;
}

/**
 * Shown to a student whose platform license has not been activated yet
 * (admitted beyond the school's purchased licenses) or whose school's
 * subscription has expired.
 */
export function LicensePaywall({ moduleName, action }: LicensePaywallProps) {
  return (
    <div
      role="status"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.75rem",
        padding: "3rem 1.5rem",
        textAlign: "center",
        border: "1px dashed var(--eduos-border, #d1d5db)",
        borderRadius: "12px",
        background: "var(--eduos-surface, #fafafa)",
      }}
    >
      <svg
        width={40}
        height={40}
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--eduos-text-muted, #6b7280)"
        strokeWidth={1.6}
        aria-hidden
      >
        <rect x="4" y="10" width="16" height="10" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        <circle cx="12" cy="15" r="1.5" />
      </svg>
      <h2 style={{ margin: 0, fontSize: "1.1rem" }}>
        {moduleName ? `${moduleName} is locked` : "This feature is locked"}
      </h2>
      <p style={{ margin: 0, maxWidth: "26rem", fontSize: "0.875rem", color: "var(--eduos-text-muted, #6b7280)" }}>
        Your student account is awaiting a platform license. Access will open automatically once
        your school completes the licensing payment — please contact the school office for details.
      </p>
      {action}
    </div>
  );
}
