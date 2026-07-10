"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect } from "react";
import {
  AUTH_ROUTES,
  DASHBOARD_PATH_BY_ROLE,
  PARENT_NAV,
  isParentNavItemActive,
  resolveParentNavId,
} from "@eduos/constants";
import { useAuth, useMobileNav, useSidebarCollapsed } from "@eduos/hooks";
import { PortalAlertsBanners, PortalNavScrim, PortalNavToggle, LoadingScreen, PortalHeaderTitles, buildPortalShellClass, InlineLoading } from "@eduos/ui";
import { PortalSidebar } from "@/components/layout/PortalSidebar";
import { parentApiUrl, useParentChild } from "@/lib/parent/parent-child-context";
import { useAlertsBanner } from "@/lib/queries";
import { ParentChildSwitcher } from "./ParentChildSwitcher";
import { PortalUserFooter } from "@/components/shared/PortalUserFooter";
import { useTenantBranding } from "@/components/shared/portal-polish/useTenantBranding";
import { ParentNavIcon } from "./ParentNavIcon";

function userInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function resolveParentTitle(pathname: string): string {
  const navId = resolveParentNavId(pathname);
  return PARENT_NAV.find((item) => item.id === navId)?.label ?? "Parent";
}

function ParentShellInner({ title, children }: { title?: string; children: ReactNode }) {
  const pathname = usePathname();
  const pageTitle = title ?? resolveParentTitle(pathname);
  const router = useRouter();
  const { user, isLoading, logout, refreshUser } = useAuth();
  const { collapsed, toggle, ready } = useSidebarCollapsed();
  const { open: mobileNavOpen, openNav, closeNav } = useMobileNav(pathname);
  const { loading: childrenLoading, error: childrenError, portalBlocked, href, childId } =
    useParentChild();
  const branding = useTenantBranding();
  const alerts = useAlertsBanner(childId ? parentApiUrl("/api/parent/alerts", childId) : null);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      refreshUser();
      return;
    }
    if (user.role !== "parent") {
      const id = window.setTimeout(() => router.replace(DASHBOARD_PATH_BY_ROLE[user.role]), 0);
      return () => window.clearTimeout(id);
    }
  }, [isLoading, user, router, refreshUser]);

  async function handleLogout() {
    await logout();
    router.push(AUTH_ROUTES.login);
  }

  if (isLoading || !user || user.role !== "parent") {
    return <LoadingScreen />;
  }

  if (portalBlocked) {
    return (
      <div className="eduos-portal-loading" style={{ padding: "2rem", textAlign: "center" }}>
        <h1 className="eduos-headline-md">Parent portal unavailable</h1>
        <p style={{ color: "var(--eduos-text-muted)", marginTop: "0.5rem" }}>{childrenError}</p>
      </div>
    );
  }

  const isCollapsed = ready && collapsed;
  const shellClass = buildPortalShellClass("parent", {
    collapsed: isCollapsed,
    mobileNavOpen,
  });
  const initials = userInitials(user.name);
  const institutionLabel = branding?.institutionName ?? null;
  const headerSubtitle = institutionLabel ? `Parent · ${institutionLabel}` : "Parent portal";

  return (
    <div className={shellClass}>
      <PortalSidebar
        branding={branding}
        brandSubtitle="Parent"
        collapsed={isCollapsed}
        onToggle={toggle}
        nav={
          <>
            {PARENT_NAV.map((item) => {
              const active = isParentNavItemActive(pathname, item);
              return (
                <Link
                  key={item.id}
                  href={href(item.href)}
                  className={`eduos-admin-nav-link${active ? " eduos-admin-nav-link--active" : ""}`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <span className="eduos-admin-nav-link__icon">
                    <ParentNavIcon id={item.id} active={active} />
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
            <PortalHeaderTitles title={pageTitle} subtitle={headerSubtitle} />
            <ParentChildSwitcher />
          </div>
        </header>
        <main className="eduos-portal-content">
          <div className="eduos-portal-page">
            {childrenLoading ? (
              <InlineLoading />
            ) : childrenError ? (
              <p className="eduos-admin-message eduos-admin-message--error">{childrenError}</p>
            ) : (
              <>
                <PortalAlertsBanners apiUrl={null} alerts={alerts} refreshKey={childId} />
                {children}
              </>
            )}
          </div>
        </main>
      </div>

      <PortalNavScrim onClick={closeNav} />
    </div>
  );
}

export function ParentShell({ title, children }: { title?: string; children: ReactNode }) {
  return <ParentShellInner title={title}>{children}</ParentShellInner>;
}
