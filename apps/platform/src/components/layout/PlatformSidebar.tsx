"use client";

import type { ReactNode } from "react";
import {
  EduOSBrand,
  EduOSMark,
  SidebarCollapseButton,
  SidebarExpandButton,
} from "@eduos/ui";

export function PlatformSidebar({
  collapsed,
  onToggle,
  nav,
  footer,
}: {
  collapsed: boolean;
  onToggle: () => void;
  nav: ReactNode;
  footer: ReactNode;
}) {
  return (
    <aside className="eduos-portal-sidebar" aria-label="Main navigation">
      <div className="eduos-portal-sidebar__head">
        <div className="eduos-portal-sidebar__brand">
          {collapsed ? (
            <EduOSMark size={28} />
          ) : (
            <EduOSBrand subtitle="Platform Owner" />
          )}
        </div>
        {collapsed ? (
          <SidebarExpandButton onClick={onToggle} />
        ) : (
          <SidebarCollapseButton onClick={onToggle} />
        )}
      </div>
      <nav className="eduos-portal-sidebar__nav">{nav}</nav>
      <div className="eduos-portal-sidebar__footer">{footer}</div>
    </aside>
  );
}
