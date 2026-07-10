import type { ReactNode } from "react";
import { AuthBrandHeader, EduOSBrand } from "../brand/EduOSBrand";

const AUTH_FEATURES = [
  "Attendance & leave workflows",
  "Academics, exams, and fees",
  "Announcements to your community",
] as const;

interface AuthCardProps {
  institutionName: string;
  logoUrl?: string | null;
  title: string;
  children: ReactNode;
}

export function AuthCard({
  institutionName,
  logoUrl,
  title,
  children,
}: AuthCardProps) {
  return (
    <div className="eduos-auth-layout">
      <aside className="eduos-auth-brand-aside">
        <div className="eduos-auth-brand-aside__inner">
          <div>
            <EduOSBrand subtitle="Institution portal" size="lg" showMark onDark />
            <p className="eduos-auth-brand-tagline" style={{ marginTop: "1.25rem" }}>
              Manage academics, attendance, and communications in one place.
            </p>
          </div>
          <ul className="eduos-auth-features">
            {AUTH_FEATURES.map((text) => (
              <li key={text}>
                <span className="eduos-auth-features__icon" aria-hidden>
                  ✓
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <div className="eduos-auth-form-wrap">
        <div className="eduos-auth-mobile-brand">
          <EduOSBrand subtitle="Institution portal" size="md" showMark />
        </div>
        <div className="eduos-auth-card">
          <AuthBrandHeader institutionName={institutionName} logoUrl={logoUrl} title={title} />
          {children}
        </div>
      </div>
    </div>
  );
}
