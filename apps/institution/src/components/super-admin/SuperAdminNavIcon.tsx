"use client";

export function SuperAdminNavIcon({ id, active }: { id: string; active: boolean }) {
  const color = active ? "var(--eduos-brand)" : "var(--eduos-text-subtle)";
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: 2 } as const;

  switch (id) {
    case "dashboard":
      return (
        <svg {...common} aria-hidden>
          <path d="M3 13h8V3H3v10Z" />
          <path d="M13 21h8v-6h-8v6Z" />
          <path d="M13 3h8v10h-8V3Z" />
          <path d="M3 21h8v-6H3v6Z" />
        </svg>
      );
    case "branches":
      return (
        <svg {...common} aria-hidden>
          <path d="M12 2v6" />
          <path d="M6 22v-6a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v6" />
          <path d="M6 8h12" />
          <path d="M8 8v4" />
          <path d="M16 8v4" />
        </svg>
      );
    case "analytics":
      return (
        <svg {...common} aria-hidden>
          <path d="M4 19V5" />
          <path d="M4 19h16" />
          <path d="M8 17V11" />
          <path d="M12 17V7" />
          <path d="M16 17V13" />
        </svg>
      );
    case "plan":
      return (
        <svg {...common} aria-hidden>
          <path d="M7 3h10a2 2 0 0 1 2 2v14l-4-2-4 2-4-2-4 2V5a2 2 0 0 1 2-2Z" />
          <path d="M8 7h8" />
          <path d="M8 11h8" />
        </svg>
      );
    case "tickets":
      return (
        <svg {...common} aria-hidden>
          <path d="M4 8a2 2 0 0 1 2-2h2a2 2 0 0 0 4 0h2a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2h-2a2 2 0 0 0-4 0H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8Z" />
          <path d="M9 12h6" />
        </svg>
      );
    case "announcements":
      return (
        <svg {...common} aria-hidden>
          <path d="M3 11v2a2 2 0 0 0 2 2h1l4 4v-4h7a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2Z" />
          <path d="M7 12h6" />
        </svg>
      );
    case "settings":
      return (
        <svg {...common} aria-hidden>
          <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
          <path d="M19.4 15a7.8 7.8 0 0 0 .1-2l2-1.5-2-3.5-2.4 1a8.1 8.1 0 0 0-1.7-1l-.4-2.6H11l-.4 2.6a8.1 8.1 0 0 0-1.7 1l-2.4-1-2 3.5 2 1.5a7.8 7.8 0 0 0 .1 2l-2 1.5 2 3.5 2.4-1a8.1 8.1 0 0 0 1.7 1l.4 2.6h4l.4-2.6a8.1 8.1 0 0 0 1.7-1l2.4 1 2-3.5-2-1.5Z" />
        </svg>
      );
    case "account":
      return (
        <svg {...common} aria-hidden>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
        </svg>
      );
    case "fees":
      return (
        <svg {...common} aria-hidden>
          <path d="M12 1v22" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      );
    case "billing":
      return (
        <svg {...common} aria-hidden>
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <path d="M2 10h20" />
          <path d="M6 15h4" />
        </svg>
      );
    case "hrPayroll":
      return (
        <svg {...common} aria-hidden>
          <rect x="5" y="4" width="14" height="16" rx="2" />
          <circle cx="12" cy="10" r="2.5" />
          <path d="M8 16h8" />
          <path d="M8 7h8" />
        </svg>
      );
    case "alerts":
      return (
        <svg {...common} aria-hidden>
          <path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 7h18s-3 0-3-7Z" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      );
    case "admins":
      return (
        <svg {...common} aria-hidden>
          <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
          <path d="M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
          <path d="M20 8v6" />
          <path d="M23 11h-6" />
        </svg>
      );
    default:
      return (
        <svg {...common} aria-hidden>
          <path d="M12 2v20" />
          <path d="M2 12h20" />
        </svg>
      );
  }
}

