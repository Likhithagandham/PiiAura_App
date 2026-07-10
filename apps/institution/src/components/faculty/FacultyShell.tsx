"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useMemo } from "react";
import {
  AUTH_ROUTES,
  DASHBOARD_PATH_BY_ROLE,
  getFacultyNavForInstitutionType,
  isFacultyNavItemActive,
} from "@eduos/constants";
import { useAuth, useMobileNav, useSidebarCollapsed } from "@eduos/hooks";
import {
  PortalAlertsBanners,
  PortalHeaderTitles,
  PortalNavScrim,
  PortalNavToggle,
  SidebarExpandButton,
  LoadingScreen,
  buildPortalShellClass,
} from "@eduos/ui";
import { IconSchool } from "@/components/admin/ui/AdminIcons";
import { PortalSidebar } from "@/components/layout/PortalSidebar";
import { PortalUserFooter } from "@/components/shared/PortalUserFooter";
import { useTenantBranding } from "@/components/shared/portal-polish/useTenantBranding";
import { useAlertsBanner } from "@/lib/queries";
import { FacultyNavIcon } from "./FacultyNavIcon";
import { useFacultyScope } from "./FacultyScopeContext";

function userInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function FacultyShell({
  title,
  children,
  headerExtra,
}: {
  title: string;
  children: ReactNode;
  headerExtra?: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, logout, refreshUser } = useAuth();
  const { institutionType, settingsReady, setInstitutionType } = useFacultyScope();
  const { collapsed, toggle, ready } = useSidebarCollapsed();
  const { open: mobileNavOpen, openNav, closeNav } = useMobileNav(pathname);
  const branding = useTenantBranding();
  const alerts = useAlertsBanner("/api/faculty/alerts");

  const navItems = useMemo(
    () => getFacultyNavForInstitutionType(institutionType),
    [institutionType],
  );

  const initials = user ? userInitials(user.name) : "";

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      refreshUser();
      return;
    }
    if (user.role !== "faculty") {
      const target = DASHBOARD_PATH_BY_ROLE[user.role];
      const id = window.setTimeout(() => router.replace(target), 0);
      return () => window.clearTimeout(id);
    }
  }, [isLoading, user, router, refreshUser]);

  async function handleLogout() {
    await logout();
    router.push(AUTH_ROUTES.login);
  }

  if (isLoading || !user || user.role !== "faculty") {
    return <LoadingScreen />;
  }

  const isCollapsed = ready && collapsed;
  const shellClass = buildPortalShellClass("faculty", {
    collapsed: isCollapsed,
    mobileNavOpen,
  });
  const institutionLabel = branding?.institutionName ?? null;
  const headerSubtitle = institutionLabel ? `Faculty · ${institutionLabel}` : "Faculty portal";

  return (
    <div className={shellClass}>
      <PortalSidebar
        branding={branding}
        brandSubtitle="Faculty"
        collapsed={isCollapsed}
        onToggle={toggle}
        nav={
          <>
            {navItems.map((item) => {
              const active = isFacultyNavItemActive(pathname, item);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`eduos-admin-nav-link${active ? " eduos-admin-nav-link--active" : ""}`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <span className="eduos-admin-nav-link__icon">
                    <FacultyNavIcon id={item.id} active={active} />
                  </span>
                  <span className="eduos-admin-nav-link__label">{item.label}</span>
                </Link>
              );
            })}
          </>
        }
        footer={
          <PortalUserFooter
            name={user.name}
            initials={initials}
            collapsed={isCollapsed}
            onLogout={handleLogout}
          />
        }
      />

      <div className="eduos-portal-main">
        <header className="eduos-portal-header">
          <div className="eduos-portal-header__title-row" data-tour="header-title-row">
            <PortalNavToggle onClick={openNav} />
            {isCollapsed ? <SidebarExpandButton onClick={toggle} /> : null}
            <PortalHeaderTitles title={title} subtitle={headerSubtitle} />
            {headerExtra}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
            <div role="group" aria-label="Institution scope" className="portal-scope-toggle">
              {(
                [
                  { value: "school" as const, label: "School", Icon: IconSchool },
                ] as const
              ).map(({ value, label, Icon }) => {
                const active = institutionType === value;
                return (
                  <button
                    key={value}
                    type="button"
                    disabled={!settingsReady}
                    className={`portal-scope-toggle__btn${active ? " portal-scope-toggle__btn--active" : ""}`}
                    onClick={() => {
                      if (value === institutionType) return;
                      setInstitutionType(value);
                    }}
                  >
                    <span className="eduos-scope-toggle__icon" aria-hidden>
                      <Icon color={active ? "var(--portal-primary-mid)" : "var(--eduos-text-subtle)"} size={14} />
                    </span>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </header>
        <main className="eduos-portal-content">
          <div className="eduos-portal-page">
            <PortalAlertsBanners apiUrl={null} alerts={alerts} />
            {children}
          </div>
        </main>
      </div>

      <PortalNavScrim onClick={closeNav} />
    </div>
  );
}
