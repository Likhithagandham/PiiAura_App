/** Line icons for dashboard cards (matches reference mockup) */

const stroke = {
  fill: "none",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconCalendarHoliday({ color = "currentColor" }: { color?: string }) {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" aria-hidden {...stroke} stroke={color}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" />
      <path d="M10 14h4M12 12v4" />
    </svg>
  );
}

export function IconMegaphone({ color = "currentColor" }: { color?: string }) {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" aria-hidden {...stroke} stroke={color}>
      <path d="M4 11v2a2 2 0 0 0 2 2h1l5 4V5L7 9H6a2 2 0 0 0-2 2z" />
      <path d="M16 8.5a5 5 0 0 1 0 7M18 6a8 8 0 0 1 0 12" />
    </svg>
  );
}

export function IconTrendUp({ color = "currentColor" }: { color?: string }) {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" aria-hidden {...stroke} stroke={color}>
      <path d="M4 16l6-6 4 4 6-8" />
      <path d="M14 6h6v6" />
    </svg>
  );
}
