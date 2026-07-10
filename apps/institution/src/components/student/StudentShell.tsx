"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect } from "react";
import {
  AUTH_ROUTES,
  DASHBOARD_PATH_BY_ROLE,
  STUDENT_NAV,
  isStudentNavItemActive,
  resolveStudentNavId,
} from "@eduos/constants";
import type { StudentAccessInfo } from "@eduos/types";
import { useAuth, useMobileNav, useSidebarCollapsed } from "@eduos/hooks";
import { useApiData, useAlertsBanner } from "@/lib/queries";
import { useTenantBranding } from "@/components/shared/portal-polish/useTenantBranding";
import { LicensePaywall, PortalAlertsBanners, PortalNavScrim, PortalNavToggle, LoadingScreen, PortalHeaderTitles, buildPortalShellClass } from "@eduos/ui";
import { PortalSidebar } from "@/components/layout/PortalSidebar";
import { PortalUserFooter } from "@/components/shared/PortalUserFooter";
import { StudentNavIcon } from "./StudentNavIcon";

function userInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function StudentShell({ title, children }: { title: string; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, logout, refreshUser } = useAuth();
  const { collapsed, toggle, ready } = useSidebarCollapsed();
  const { open: mobileNavOpen, openNav, closeNav } = useMobileNav(pathname);
  const branding = useTenantBranding();
  const alerts = useAlertsBanner("/api/student/alerts");

  const { data: unreadData, refetch: refreshNoticeCount } = useApiData<{ unreadCount?: number }>(
    "/api/student/announcements/unread-count",
    { staleTime: 30_000 },
  );
  const unreadNotices = unreadData?.unreadCount ?? 0;

  // Platform licensing — unlicensed students lose premium modules.
  const { data: access } = useApiData<StudentAccessInfo>("/api/student/access", {
    staleTime: 60_000,
  });
  const blockedModules = access?.blockedModules ?? [];

  // Refresh the badge when the notices page marks things read, and on navigation.
  useEffect(() => {
    void refreshNoticeCount();
    const onRead = () => void refreshNoticeCount();
    window.addEventListener("notices-read", onRead);
    return () => window.removeEventListener("notices-read", onRead);
  }, [refreshNoticeCount, pathname]);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      refreshUser();
      return;
    }
    if (user.role !== "student") {
      const id = window.setTimeout(() => router.replace(DASHBOARD_PATH_BY_ROLE[user.role]), 0);
      return () => window.clearTimeout(id);
    }
  }, [isLoading, user, router, refreshUser]);

  async function handleLogout() {
    await logout();
    router.push(AUTH_ROUTES.login);
  }

  if (isLoading || !user || user.role !== "student") {
    return <LoadingScreen />;
  }

  const isCollapsed = ready && collapsed;
  const shellClass = buildPortalShellClass("student", {
    collapsed: isCollapsed,
    mobileNavOpen,
  });
  const initials = userInitials(user.name);
  const websiteUrl = branding?.websiteUrl?.trim() || null;
  const institutionLabel = branding?.institutionName ?? null;
  const headerSubtitle = institutionLabel
    ? `${user.custom_login_id ?? "Student"} · ${institutionLabel}`
    : user.custom_login_id ?? "Student portal";

  return (
    <div className={shellClass}>
      <PortalSidebar
        branding={branding}
        brandSubtitle="Student"
        collapsed={isCollapsed}
        onToggle={toggle}
        nav={
          <>
            {STUDENT_NAV.filter((item) => !blockedModules.includes(item.id)).map((item) => {
              const active = isStudentNavItemActive(pathname, item);
              const glow = item.id === "notices" && unreadNotices > 0;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`eduos-admin-nav-link${active ? " eduos-admin-nav-link--active" : ""}`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <span
                    className="eduos-admin-nav-link__icon"
                    style={glow ? { animation: "eduos-notice-glow 1.6s ease-in-out infinite", borderRadius: "999px" } : undefined}
                  >
                    <StudentNavIcon id={item.id} active={active} />
                  </span>
                  <span className="eduos-admin-nav-link__label">
                    {item.label}
                    {glow ? <span className="portal-nav-badge">{unreadNotices}</span> : null}
                  </span>
                </Link>
              );
            })}
            {websiteUrl ? (
              <a
                href={websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="eduos-admin-nav-link"
                title={isCollapsed ? "Institution website" : undefined}
              >
                <span className="eduos-admin-nav-link__icon">
                  <svg
                    width={18}
                    height={18}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--eduos-text-muted)"
                    strokeWidth={2}
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M2 12h20" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </span>
                <span className="eduos-admin-nav-link__label">Institution website</span>
              </a>
            ) : null}
            <style>{`
              @keyframes eduos-notice-glow {
                0%, 100% { box-shadow: 0 0 0 0 rgba(26, 95, 74, 0.0); }
                50% { box-shadow: 0 0 0 4px rgba(26, 95, 74, 0.35); }
              }
            `}</style>
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
            <PortalHeaderTitles title={title} subtitle={headerSubtitle} />
          </div>
        </header>
        <main className="eduos-portal-content">
          <div className="eduos-portal-page">
            {(pathname.startsWith("/student/dashboard") || pathname.startsWith("/student/alerts")) && (
              <PortalAlertsBanners apiUrl={null} alerts={alerts} />
            )}
            {blockedModules.length > 0 && pathname.startsWith("/student/dashboard") ? (
              <p className="eduos-admin-message eduos-admin-message--error" role="status">
                Your student license is awaiting activation — some features are locked until your
                school completes the licensing payment. Please contact the school office.
              </p>
            ) : null}
            {blockedModules.includes(resolveStudentNavId(pathname)) ? (
              <LicensePaywall
                moduleName={STUDENT_NAV.find((i) => i.id === resolveStudentNavId(pathname))?.label}
                action={
                  <Link href="/student/dashboard" className="eduos-link">
                    Back to dashboard
                  </Link>
                }
              />
            ) : (
              children
            )}
          </div>
        </main>
      </div>

      <PortalNavScrim onClick={closeNav} />
    </div>
  );
}
