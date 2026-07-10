"use client";

/**
 * Hamburger trigger for the mobile portal drawer. Hidden on desktop via CSS
 * (`.eduos-portal-hamburger`); place it inside the portal header title row.
 */
export function PortalNavToggle({
  onClick,
  "aria-label": ariaLabel = "Open navigation",
}: {
  onClick: () => void;
  "aria-label"?: string;
}) {
  return (
    <button
      type="button"
      className="eduos-portal-hamburger"
      onClick={onClick}
      aria-label={ariaLabel}
      data-tour="nav-toggle"
    >
      <svg
        width={22}
        height={22}
        viewBox="0 0 24 24"
        aria-hidden
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
      >
        <path d="M4 7h16M4 12h16M4 17h16" />
      </svg>
    </button>
  );
}

/**
 * Dimmed overlay shown behind the open mobile drawer. Visible only when the
 * shell carries `eduos-portal-shell--mobile-nav-open`; render it once per shell.
 */
export function PortalNavScrim({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      className="eduos-portal-scrim"
      aria-label="Close navigation"
      tabIndex={-1}
      onClick={onClick}
    />
  );
}
