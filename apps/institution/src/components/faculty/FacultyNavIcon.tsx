import type { FacultyNavId } from "@eduos/constants";

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

export function FacultyNavIcon({ id, active = false }: { id: FacultyNavId; active?: boolean }) {
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
    case "timetable":
      return (
        <svg {...p} aria-hidden>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
          <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
        </svg>
      );
    case "attendance":
      return (
        <svg {...p} aria-hidden>
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M9 12l2 2 5-5" />
        </svg>
      );
    case "leave":
      return (
        <svg {...p} aria-hidden>
          <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6z" />
          <path d="M14 3v6h6M8 13h8M8 17h5" />
        </svg>
      );
    case "homework":
      return (
        <svg {...p} aria-hidden>
          <path d="M6 4h9l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
          <path d="M15 4v5h5M8 12h8M8 16h6" />
        </svg>
      );
    case "notes":
      return (
        <svg {...p} aria-hidden>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
          <path d="M14 2v6h6M12 18v-6M9 15h6" />
        </svg>
      );
    case "assignments":
      return (
        <svg {...p} aria-hidden>
          <path d="M4 7h16v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7z" />
          <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
        </svg>
      );
    case "ai":
      return (
        <svg {...p} aria-hidden>
          <path d="M12 3l1.2 3.6L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2L12 3z" />
          <path d="M5 16l.8 2.4L8 19l-2.2.7L5 22l-.8-2.3L2 19l2.2-.6L5 16z" />
          <path d="M19 14l.6 1.8L21 16l-1.4.4L19 18l-.6-1.6L17 16l1.4-.4L19 14z" />
        </svg>
      );
    case "marks":
      return (
        <svg {...p} aria-hidden>
          <path d="M8 4h11v16H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
          <path d="M8 8h7M8 12h7M8 16h4" />
          <path d="M6 9v6" />
        </svg>
      );
    case "syllabus":
      return (
        <svg {...p} aria-hidden>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M4 4.5A2.5 2.5 0 0 1 6.5 7H20v13H6.5A2.5 2.5 0 0 1 4 17.5v-13z" />
          <path d="M8 7h8M8 11h8" />
        </svg>
      );
    case "invigilation":
      return (
        <svg {...p} aria-hidden>
          <path d="M8 4h8l2 4v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8l2-4z" />
          <circle cx="12" cy="9" r="1.5" />
          <path d="M10 14h4" />
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
    case "payslip":
      return (
        <svg {...p} aria-hidden>
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <path d="M3 10h18" />
          <path d="M7 15h4" />
        </svg>
      );
    case "alerts":
      return (
        <svg {...p} aria-hidden>
          <path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 7h18s-3 0-3-7Z" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      );
    case "account":
      return (
        <svg {...p} aria-hidden>
          <circle cx="12" cy="8" r="4" />
          <path d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6" />
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
