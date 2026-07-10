"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import {
  AUTH_ROUTES,
  DASHBOARD_PATH_BY_ROLE,
  getAdminNavForInstitutionType,
  isAdminNavItemActive,
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
import { useEffect, useMemo, useRef } from "react";
import { PortalSidebar } from "@/components/layout/PortalSidebar";
import { useAdminScope } from "./AdminScopeContext";
import { IconBell, IconSchool } from "./ui/AdminIcons";
import { PortalUserFooter } from "@/components/shared/PortalUserFooter";
import { AdminNavIcon } from "./AdminNavIcon";
import { useTenantBranding } from "@/components/shared/portal-polish/useTenantBranding";
import { useAlertsBanner } from "@/lib/queries";
import { useLicensingSummaryQuery } from "@/lib/licensing-queries";

/** Warning banner shown on every admin page while the branch has unpaid students. */
function LicenseStatusBanner() {
  const { data } = useLicensingSummaryQuery("admin");
  const count = data?.branchUnlicensedStudents ?? 0;
  if (!data || count === 0) return null;
  return (
    <p className="eduos-admin-message eduos-admin-message--error" role="status">
      {count} student{count === 1 ? "" : "s"} in this branch{" "}
      {count === 1 ? "is" : "are"} awaiting a platform license (
      ₹{(data.branchPendingAmountInr ?? 0).toLocaleString("en-IN")} pending).{" "}
      <Link href="/admin/billing" className="eduos-link">
        View billing
      </Link>
    </p>
  );
}

interface AdminShellProps {
  title: string;
  children: ReactNode;
}

export function AdminShell({ title, children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, logout, refreshUser } = useAuth();
  const refreshedRef = useRef(false);
  const { institutionType, settingsReady, changeInstitutionType } = useAdminScope();
  const { collapsed, toggle, ready } = useSidebarCollapsed();
  const { open: mobileNavOpen, openNav, closeNav } = useMobileNav(pathname);
  const branding = useTenantBranding();
  const alerts = useAlertsBanner("/api/admin/alerts");
  const navItems = useMemo(
    () => getAdminNavForInstitutionType(institutionType),
    [institutionType],
  );

  useEffect(() => {
    if (isLoading) return;

    if (user) {
      if (user.role === "admin") return;
      router.replace(DASHBOARD_PATH_BY_ROLE[user.role]);
      return;
    }

    if (!user && !refreshedRef.current) {
      refreshedRef.current = true;
      refreshUser();
      return;
    }

    if (!user) {
      router.replace(AUTH_ROUTES.login);
    }
  }, [user, isLoading, router, refreshUser]);

  async function handleLogout() {
    await logout();
    router.push(AUTH_ROUTES.login);
  }

  const initials = user?.name
    ?.split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "A";

  if (isLoading || !user || user.role !== "admin") {
    return <LoadingScreen />;
  }

  const isCollapsed = ready && collapsed;
  const shellClass = buildPortalShellClass("admin", {
    collapsed: isCollapsed,
    mobileNavOpen,
  });
  const institutionLabel = branding?.institutionName ?? null;
  const headerSubtitle = institutionLabel ? `Branch Admin · ${institutionLabel}` : "Branch Admin portal";

  return (
    <div className={shellClass}>
      <PortalSidebar
        branding={branding}
        brandSubtitle="Branch Admin"
        collapsed={isCollapsed}
        onToggle={toggle}
        nav={
          <>
            {navItems.map((item) => {
              const active = isAdminNavItemActive(pathname, item);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`eduos-admin-nav-link${active ? " eduos-admin-nav-link--active" : ""}`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <span className="eduos-admin-nav-link__icon">
                    <AdminNavIcon id={item.id} active={active} />
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
                      if (value !== institutionType) void changeInstitutionType(value);
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
            <button type="button" aria-label="Notifications" className="eduos-header-icon-btn" data-tour="notifications">
              <IconBell color="var(--eduos-text-subtle)" />
            </button>
            <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>{user.name}</span>
          </div>
        </header>

        <main className="eduos-portal-content">
          <PortalAlertsBanners apiUrl={null} alerts={alerts} />
          <LicenseStatusBanner />
          <div className="eduos-admin-page">{children}</div>
        </main>
      </div>

      <PortalNavScrim onClick={closeNav} />
    </div>
  );
}
