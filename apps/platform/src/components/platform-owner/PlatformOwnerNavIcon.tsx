import type { PlatformOwnerNavId } from "@eduos/constants";

export function PlatformOwnerNavIcon({
  id,
  active,
}: {
  id: PlatformOwnerNavId;
  active: boolean;
}) {
  const opacity = active ? 1 : 0.7;
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    style: { opacity },
  };

  switch (id) {
    case "dashboard":
      return (
        <svg {...common} aria-hidden>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );
    case "analytics":
      return (
        <svg {...common} aria-hidden>
          <path d="M4 20V10M10 20V4M16 20v-6M22 20v-9" />
        </svg>
      );
    case "tenants":
      return (
        <svg {...common} aria-hidden>
          <path d="M4 7h16M4 12h16M4 17h10" />
          <circle cx="18" cy="17" r="2" />
        </svg>
      );
    case "plans":
      return (
        <svg {...common} aria-hidden>
          <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" />
        </svg>
      );
    case "support":
      return (
        <svg {...common} aria-hidden>
          <path d="M12 3v4M8 7h8a4 4 0 0 1 0 8H9a3 3 0 0 0 0 6h6" />
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
    case "billing":
      return (
        <svg {...common} aria-hidden>
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <path d="M3 10h18" />
          <path d="M7 15h4" />
        </svg>
      );
    case "settings":
      return (
        <svg {...common} aria-hidden>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      );
    default:
      return (
        <svg {...common} aria-hidden>
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
  }
}
