import type { CSSProperties } from "react";

export type EduOSBrandSize = "sm" | "md" | "lg";

interface EduOSBrandProps {
  /** e.g. "Branch Admin", institution name */
  subtitle?: string;
  size?: EduOSBrandSize;
  /** Small line mark beside wordmark (sidebar / login) */
  showMark?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Invert colors for dark panels (login brand side) */
  onDark?: boolean;
}

const sizeStyles: Record<EduOSBrandSize, { wordmark: string; subtitle: string; mark: number }> = {
  sm: { wordmark: "1rem", subtitle: "0.6875rem", mark: 28 },
  md: { wordmark: "1.125rem", subtitle: "0.75rem", mark: 32 },
  lg: { wordmark: "1.5rem", subtitle: "0.8125rem", mark: 40 },
};

/** Stored fallback brand mark path (kept for reference; EduOSMark renders inline). */
export const PIIAURA_FALLBACK_LOGO = "/piiaura-logo.svg";

/**
 * PiiAura brand mark, rendered inline (no /public fetch) so it never 404s or
 * depends on dev-server asset caching. Self-contained badge: white marks on a
 * dark rounded square, readable on both light and dark surfaces.
 */
export function EduOSMark({ size = 32 }: { size?: number; onDark?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      role="img"
      aria-label="PiiAura"
      style={{ flexShrink: 0, display: "block" }}
    >
      <rect width="512" height="512" rx="96" fill="#0a0a0a" />
      <rect x="40" y="40" width="432" height="432" rx="72" fill="none" stroke="#ffffff" strokeWidth="6" />
      <g fill="#ffffff">
        <path d="M150 150 h78 a58 58 0 0 1 0 116 h-40 v94 h-38 z M188 186 v44 h40 a22 22 0 0 0 0-44 z" />
        <rect x="270" y="206" width="34" height="154" rx="6" />
        <circle cx="287" cy="178" r="20" />
        <rect x="322" y="206" width="34" height="154" rx="6" />
        <rect x="322" y="150" width="22" height="22" />
        <rect x="352" y="132" width="20" height="20" />
        <rect x="350" y="100" width="16" height="16" />
        <rect x="380" y="112" width="18" height="18" />
        <rect x="388" y="84" width="14" height="14" />
        <rect x="372" y="156" width="10" height="10" />
      </g>
      <text x="256" y="408" fill="#ffffff" textAnchor="middle"
        fontFamily="Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
        fontSize="78" fontWeight="500" letterSpacing="14">AURA</text>
      <line x1="150" y1="446" x2="184" y2="446" stroke="#ffffff" strokeWidth="4" />
      <line x1="328" y1="446" x2="362" y2="446" stroke="#ffffff" strokeWidth="4" />
      <text x="256" y="454" fill="#ffffff" textAnchor="middle"
        fontFamily="Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
        fontSize="26" fontWeight="500" letterSpacing="8">ERP SOLUTIONS</text>
    </svg>
  );
}

export function EduOSBrand({
  subtitle,
  size = "md",
  showMark = false,
  className,
  style,
  onDark = false,
}: EduOSBrandProps) {
  const s = sizeStyles[size];
  const wordmarkColor = onDark ? "#ffffff" : "var(--eduos-brand, var(--eduos-primary))";
  const subtitleColor = onDark ? "rgba(255,255,255,0.82)" : "var(--eduos-text-muted)";

  return (
    <div
      className={`eduos-brand${className ? ` ${className}` : ""}`}
      style={{ display: "flex", alignItems: "center", gap: "0.625rem", ...style }}
    >
      {showMark ? <EduOSMark size={s.mark} onDark={onDark} /> : null}
      <div>
        <div
          className="eduos-brand__wordmark"
          style={{
            fontFamily: "var(--eduos-font)",
            fontWeight: 700,
            fontSize: s.wordmark,
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
            color: wordmarkColor,
          }}
        >
          PiiAura
        </div>
        {subtitle ? (
          <div
            className="eduos-brand__subtitle"
            style={{
              fontFamily: "var(--eduos-font)",
              fontWeight: 400,
              fontSize: s.subtitle,
              lineHeight: 1.35,
              color: subtitleColor,
              marginTop: "0.15rem",
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** Institution logo image with EduOS fallback */
export function InstitutionLogo({
  logoUrl,
  institutionName,
  size = 48,
}: {
  logoUrl?: string | null;
  institutionName: string;
  size?: number;
}) {
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt={`${institutionName} logo`}
        style={{ height: size, width: "auto", maxWidth: "100%", objectFit: "contain" }}
      />
    );
  }
  return <EduOSMark size={size} />;
}

export function AuthBrandHeader({
  institutionName,
  logoUrl,
  title,
}: {
  institutionName: string;
  logoUrl?: string | null;
  title: string;
}) {
  return (
    <header className="eduos-auth-card-header">
      <div className="eduos-auth-card-header__logo">
        <InstitutionLogo logoUrl={logoUrl} institutionName={institutionName} size={52} />
      </div>
      <span className="eduos-auth-institution-badge">{institutionName}</span>
      <h1 className="eduos-auth-card-title">{title}</h1>
    </header>
  );
}
