/** Shared line icons for admin portal (matches dashboard reference) */

const stroke = {
  fill: "none",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconBell({ color = "currentColor", size = 20 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke} stroke={color}>
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

export function IconSchool({ color = "currentColor", size = 16 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke} stroke={color}>
      <path d="M3 9.5 12 4l9 5.5M5 10.5V18h4v-4h2v4h4v-7.5" />
      <path d="M12 4v3" />
    </svg>
  );
}

export function IconCollege({ color = "currentColor", size = 16 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke} stroke={color}>
      <path d="M22 10v6M2 10l10-6 10 6-10 6z" />
      <path d="M6 12v6h3v-4h6v4h3v-6" />
    </svg>
  );
}

export function IconWarning({ color = "currentColor", size = 18 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke} stroke={color}>
      <path d="M12 9v4M12 17h.01" />
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    </svg>
  );
}

export { IconCalendarHoliday, IconMegaphone, IconTrendUp } from "../dashboard/DashboardIcons";
