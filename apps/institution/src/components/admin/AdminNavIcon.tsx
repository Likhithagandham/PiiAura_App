import type { AdminModuleId } from "@eduos/constants";

const strokeProps = (active: boolean) => ({
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: active ? "var(--eduos-brand)" : "var(--eduos-text-subtle)",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export function AdminNavIcon({ id, active = false }: { id: AdminModuleId; active?: boolean }) {
  const p = strokeProps(active);

  switch (id) {
    case "dashboard":
      return (
        <svg {...p} aria-hidden>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );
    case "admissions":
      return (
        <svg {...p} aria-hidden>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 20c0-3.5 3.1-6 7-6s7 2.5 7 6" />
          <path d="M17 8l1.5 1.5L21 7" />
        </svg>
      );
    case "academics":
      return (
        <svg {...p} aria-hidden>
          <path d="M4 10l8-4 8 4-8 4-8-4z" />
          <path d="M12 14v6" />
          <path d="M7 17v3" />
          <path d="M17 17v3" />
        </svg>
      );
    case "attendance":
      return (
        <svg {...p} aria-hidden>
          <rect x="4" y="5" width="16" height="15" rx="2" />
          <path d="M8 3v4M16 3v4M4 10h16" />
        </svg>
      );
    case "examinations":
      return (
        <svg {...p} aria-hidden>
          <path d="M8 4h11v16H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
          <path d="M8 8h7M8 12h7M8 16h4" />
          <circle cx="6" cy="12" r="1" fill="currentColor" stroke="none" />
          <path d="M6 9v6" />
        </svg>
      );
    case "fees":
      return (
        <svg {...p} aria-hidden>
          <rect x="3" y="7" width="18" height="10" rx="2" />
          <circle cx="12" cy="12" r="2.5" />
          <path d="M3 10h18" />
        </svg>
      );
    case "hr":
      return (
        <svg {...p} aria-hidden>
          <rect x="5" y="4" width="14" height="16" rx="2" />
          <circle cx="12" cy="10" r="2.5" />
          <path d="M8 16h8" />
        </svg>
      );
    case "users":
      return (
        <svg {...p} aria-hidden>
          <circle cx="9" cy="8" r="3" />
          <path d="M3 19c0-3 2.7-5 6-5" />
          <circle cx="17" cy="9" r="2.5" />
          <path d="M15 19c0-2.2 1.8-4 4-4" />
        </svg>
      );
    case "engagement":
      return (
        <svg {...p} aria-hidden>
          <path d="M5 6h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9l-4 3v-3H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
          <path d="M8 10h8M8 13h5" />
        </svg>
      );
    case "gallery":
      return (
        <svg {...p} aria-hidden>
          <rect x="4" y="5" width="16" height="14" rx="2" />
          <circle cx="9" cy="10" r="1.5" />
          <path d="M20 16l-5-5-6 6" />
        </svg>
      );
    case "transport":
      return (
        <svg {...p} aria-hidden>
          <path d="M4 7h16v7H4z" />
          <path d="M6 14v2M18 14v2" />
          <circle cx="7.5" cy="14" r="1.5" />
          <circle cx="16.5" cy="14" r="1.5" />
        </svg>
      );
    case "library":
      return (
        <svg {...p} aria-hidden>
          <path d="M5 19V6h3v13M12 19V6h3v13M19 19V6h-3v13" />
        </svg>
      );
    case "infra":
      return (
        <svg {...p} aria-hidden>
          <path d="M4 20V8l8-4 8 4v12" />
          <path d="M9 20v-6h6v6" />
        </svg>
      );
    case "visitors":
      return (
        <svg {...p} aria-hidden>
          <rect x="5" y="4" width="14" height="16" rx="2" />
          <circle cx="12" cy="10" r="2.5" />
          <path d="M8 16h8" />
        </svg>
      );
    case "account":
      return (
        <svg {...p} aria-hidden>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 20c0-3.5 3.1-6 7-6s7 2.5 7 6" />
        </svg>
      );
    case "reports":
      return (
        <svg {...p} aria-hidden>
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M8 16v-4M12 16V9M16 16v-6" />
        </svg>
      );
    case "billing":
      return (
        <svg {...p} aria-hidden>
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <path d="M2 10h20" />
          <path d="M6 15h4" />
        </svg>
      );
    case "settings":
      return (
        <svg {...p} aria-hidden>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      );
    case "alerts":
      return (
        <svg {...p} aria-hidden>
          <path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 7h18s-3 0-3-7Z" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      );
    case "grievances":
      return (
        <svg {...p} aria-hidden>
          <circle cx="12" cy="12" r="9" />
          <path d="M9.5 9.5l5 5M14.5 9.5l-5 5" />
        </svg>
      );
    case "school":
      return (
        <svg {...p} aria-hidden>
          <path d="M4 10l8-5 8 5v10H4V10z" />
          <path d="M10 20v-5h4v5" />
        </svg>
      );
    case "college":
      return (
        <svg {...p} aria-hidden>
          <path d="M3 10l9-5 9 5-9 5-9-5z" />
          <path d="M12 15v6" />
          <path d="M6 18h12" />
        </svg>
      );
    default:
      return (
        <svg {...p} aria-hidden>
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
  }
}
