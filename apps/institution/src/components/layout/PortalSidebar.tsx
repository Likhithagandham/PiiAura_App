"use client";

import type { ReactNode } from "react";
import type { TenantBranding } from "@eduos/types";
import {
  EduOSBrand,
  EduOSMark,
  InstitutionLogo,
  SidebarCollapseButton,
  SidebarExpandButton,
} from "@eduos/ui";

export function PortalSidebar({
  branding,
  brandSubtitle,
  collapsed,
  onToggle,
  nav,
  footer,
}: {
  branding?: TenantBranding | null;
  brandSubtitle: string;
  collapsed: boolean;
  onToggle: () => void;
  nav: ReactNode;
  footer: ReactNode;
}) {
  return (
    <aside className="eduos-portal-sidebar" aria-label="Main navigation" data-tour="sidebar">
      <div className="eduos-portal-sidebar__head">
        <div className="eduos-portal-sidebar__brand">
          {collapsed ? (
            branding ? (
              <InstitutionLogo
                logoUrl={branding.logoUrl}
                institutionName={branding.institutionName}
                size={28}
              />
            ) : (
              <EduOSMark size={28} />
            )
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", minWidth: 0 }}>
              {branding ? (
                <InstitutionLogo
                  logoUrl={branding.logoUrl}
                  institutionName={branding.institutionName}
                  size={32}
                />
              ) : (
                <EduOSMark size={32} />
              )}
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: "var(--eduos-font)",
                    fontWeight: 800,
                    fontSize: "0.95rem",
                    lineHeight: 1.2,
                    color: "var(--eduos-brand, var(--eduos-primary))",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: 180,
                  }}
                  title={branding?.institutionName}
                >
                  {branding?.institutionName ?? "PiiAura"}
                </div>
                <div style={{ marginTop: "0.15rem" }}>
                  <EduOSBrand subtitle={brandSubtitle} size="sm" />
                </div>
              </div>
            </div>
          )}
        </div>
        {collapsed ? (
          <SidebarExpandButton onClick={onToggle} aria-label="Expand sidebar" />
        ) : (
          <SidebarCollapseButton onClick={onToggle} aria-label="Collapse sidebar" />
        )}
      </div>

      <nav className="eduos-portal-sidebar__nav">{nav}</nav>

      <div className="eduos-portal-sidebar__footer">{footer}</div>
    </aside>
  );
}
