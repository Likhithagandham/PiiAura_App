"use client";

const stroke = {
  fill: "none",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function IconChevron({ direction }: { direction: "left" | "right" }) {
  const d = direction === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6";
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" aria-hidden {...stroke} stroke="currentColor">
      <path d={d} />
    </svg>
  );
}

export function SidebarCollapseButton({
  onClick,
  "aria-label": ariaLabel = "Collapse sidebar",
}: {
  onClick: () => void;
  "aria-label"?: string;
}) {
  return (
    <button
      type="button"
      className="eduos-sidebar-toggle"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-expanded
    >
      <IconChevron direction="left" />
    </button>
  );
}

export function SidebarExpandButton({
  onClick,
  "aria-label": ariaLabel = "Expand sidebar",
}: {
  onClick: () => void;
  "aria-label"?: string;
}) {
  return (
    <button
      type="button"
      className="eduos-sidebar-toggle eduos-sidebar-toggle--expand"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-expanded={false}
    >
      <IconChevron direction="right" />
    </button>
  );
}
