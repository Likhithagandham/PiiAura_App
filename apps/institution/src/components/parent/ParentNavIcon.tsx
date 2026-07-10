import type { ParentNavId } from "@eduos/constants";

const STROKE = "currentColor";

export function ParentNavIcon({ id, active }: { id: ParentNavId; active: boolean }) {
  const opacity = active ? 1 : 0.72;
  const props = { width: 20, height: 20, fill: "none", stroke: STROKE, strokeWidth: 1.75, opacity };

  switch (id) {
    case "dashboard":
      return (
        <svg {...props} viewBox="0 0 24 24">
          <path d="M4 10.5L12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5z" />
        </svg>
      );
    case "fees":
      return (
        <svg {...props} viewBox="0 0 24 24">
          <rect x="3" y="6" width="18" height="14" rx="2" />
          <path d="M3 10h18" />
        </svg>
      );
    case "leave":
      return (
        <svg {...props} viewBox="0 0 24 24">
          <rect x="4" y="5" width="16" height="16" rx="2" />
          <path d="M8 3v4M16 3v4M4 11h16" />
        </svg>
      );
    case "academics":
      return (
        <svg {...props} viewBox="0 0 24 24">
          <path d="M12 3L2 8l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      );
    case "transport":
      return (
        <svg {...props} viewBox="0 0 24 24">
          <path d="M4 6h16v8H4z" />
          <path d="M6 14v3M18 14v3" />
          <circle cx="7.5" cy="14" r="1.5" />
          <circle cx="16.5" cy="14" r="1.5" />
        </svg>
      );
    case "library":
      return (
        <svg {...props} viewBox="0 0 24 24">
          <path d="M4 19V5h4v14M12 19V5h4v14M20 19V5h-4v14" />
        </svg>
      );
    case "alerts":
      return (
        <svg {...props} viewBox="0 0 24 24">
          <path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 7h18s-3 0-3-7Z" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      );
    case "account":
      return (
        <svg {...props} viewBox="0 0 24 24">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c1.5-4 6-6 8-6s6.5 2 8 6" />
        </svg>
      );
    default:
      return null;
  }
}
