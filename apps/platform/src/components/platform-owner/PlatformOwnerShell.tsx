"use client";



import Link from "next/link";

import { usePathname, useRouter } from "next/navigation";

import type { ReactNode } from "react";

import { useEffect } from "react";

import {

  AUTH_ROUTES,

  PLATFORM_OWNER_NAV,

  getPlatformOwnerNavTabs,

  isPlatformOwnerNavItemActive,

  isPlatformOwnerNavTabActive,

} from "@eduos/constants";

import { useAuth, useMobileNav, useSidebarCollapsed } from "@eduos/hooks";

import { PortalAlertsBanners, PortalNavScrim, PortalNavToggle, PortalHeaderTitles, buildPortalShellClass, LoadingScreen } from "@eduos/ui";

import { PlatformSidebar } from "@/components/layout/PlatformSidebar";
import { PlatformUserFooter } from "@/components/layout/PlatformUserFooter";

import { PlatformMaintenanceProvider } from "@/lib/platform-owner/maintenance-context";
import { PlatformSupportProvider } from "@/lib/platform-owner/support-context";
import { MaintenanceModeBanner } from "./MaintenanceModeBanner";
import { PlatformOwnerNavIcon } from "./PlatformOwnerNavIcon";
import { SupportModeBanner } from "./SupportModeBanner";



function userInitials(name: string): string {

  return name

    .split(/\s+/)

    .filter(Boolean)

    .slice(0, 2)

    .map((p) => p[0]?.toUpperCase() ?? "")

    .join("");

}



function PlatformOwnerShellInner({ title, children }: { title: string; children: ReactNode }) {

  const pathname = usePathname();

  const router = useRouter();

  const { user, isLoading, logout } = useAuth();

  const { collapsed, toggle, ready } = useSidebarCollapsed();

  const { open: mobileNavOpen, openNav, closeNav } = useMobileNav(pathname);



  useEffect(() => {

    if (isLoading) return;

    if (!user) {

      router.replace(AUTH_ROUTES.login);

      return;

    }

    if (user.role !== "platform_owner") {

      router.replace(AUTH_ROUTES.login);

    }

  }, [isLoading, user, router]);



  async function handleLogout() {

    await logout();

    router.push(AUTH_ROUTES.login);

  }



  if (isLoading || !user || user.role !== "platform_owner") {
    return <LoadingScreen />;
  }



  const isCollapsed = ready && collapsed;

  const shellClass = buildPortalShellClass("platform", {
    collapsed: isCollapsed,
    mobileNavOpen,
  });

  const initials = userInitials(user.name);

  const moduleTabs = getPlatformOwnerNavTabs(pathname);



  return (

    <div className={shellClass}>

      <PlatformSidebar

        collapsed={isCollapsed}

        onToggle={toggle}

        nav={

          <>

            {PLATFORM_OWNER_NAV.map((item) => {

              const active = isPlatformOwnerNavItemActive(pathname, item);

              return (

                <Link

                  key={item.id}

                  href={item.href}

                  className={`eduos-admin-nav-link${active ? " eduos-admin-nav-link--active" : ""}`}

                  title={isCollapsed ? item.label : undefined}

                >

                  <span className="eduos-admin-nav-link__icon">

                    <PlatformOwnerNavIcon id={item.id} active={active} />

                  </span>

                  <span className="eduos-admin-nav-link__label">{item.label}</span>

                </Link>

              );

            })}

          </>

        }

        footer={
          <PlatformUserFooter
            name={user.name}
            initials={initials}
            collapsed={isCollapsed}
            onLogout={handleLogout}
          />
        }

      />



      <div className="eduos-portal-main eduos-portal-main--with-support-banner">
        <MaintenanceModeBanner />
        <SupportModeBanner />

        <header className="eduos-portal-header">

          <div className="eduos-portal-header__title-row">

            <PortalNavToggle onClick={openNav} />

            <PortalHeaderTitles title={title} subtitle="Platform owner · PiiAura" />

          </div>

        </header>

        {moduleTabs.length > 1 ? (
          <nav className="eduos-portal-subnav" aria-label="Module sections">
            {moduleTabs.map((tab) => {
              const active = isPlatformOwnerNavTabActive(pathname, tab);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`eduos-portal-subnav__tab${active ? " eduos-portal-subnav__tab--active" : ""}`}
                  aria-current={active ? "page" : undefined}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        ) : null}

        <main className="eduos-portal-content">

          <div className="eduos-portal-page">
            <PortalAlertsBanners apiUrl="/api/platform-owner/alerts" />
            {children}
          </div>

        </main>

      </div>

      <PortalNavScrim onClick={closeNav} />

    </div>

  );

}



export function PlatformOwnerShell({ title, children }: { title: string; children: ReactNode }) {

  return (
    <PlatformMaintenanceProvider>
      <PlatformSupportProvider>
        <PlatformOwnerShellInner title={title}>{children}</PlatformOwnerShellInner>
      </PlatformSupportProvider>
    </PlatformMaintenanceProvider>
  );

}


