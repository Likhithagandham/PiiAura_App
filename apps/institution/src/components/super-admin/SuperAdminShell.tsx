"use client";



import Link from "next/link";

import { usePathname, useRouter } from "next/navigation";

import type { ReactNode } from "react";

import { useEffect, useMemo } from "react";

import {

  AUTH_ROUTES,

  DASHBOARD_PATH_BY_ROLE,

  SUPER_ADMIN_NAV,

  isSuperAdminNavItemActive,

  type SuperAdminNavId,

  type SuperAdminNavItem,

} from "@eduos/constants";

import { useAuth, useMobileNav, useSidebarCollapsed } from "@eduos/hooks";

import {

  PortalAlertsBanners,

  PortalHeaderTitles,

  PortalNavScrim,

  PortalNavToggle,

  LoadingScreen,

  buildPortalShellClass,

} from "@eduos/ui";

import { PortalSidebar } from "@/components/layout/PortalSidebar";

import { PortalUserFooter } from "@/components/shared/PortalUserFooter";

import { useTenantBranding } from "@/components/shared/portal-polish/useTenantBranding";

import { useAlertsBanner } from "@/lib/queries";

import { SuperAdminNavIcon } from "./SuperAdminNavIcon";



function userInitials(name: string): string {

  return name

    .split(/\s+/)

    .filter(Boolean)

    .slice(0, 2)

    .map((p) => p[0]?.toUpperCase() ?? "")

    .join("");

}



const NAV_GROUPS: { label: string; ids: SuperAdminNavId[] }[] = [

  { label: "Overview", ids: ["dashboard"] },

  { label: "Manage", ids: ["branches", "analytics", "tickets", "fees", "billing", "hrPayroll"] },

  { label: "Institution", ids: ["settings", "alerts"] },

  { label: "Account", ids: ["account"] },

];



function SuperAdminNav({ collapsed }: { collapsed: boolean }) {

  const pathname = usePathname();

  const navById = useMemo(

    () => new Map(SUPER_ADMIN_NAV.map((item) => [item.id, item] as const)),

    [],

  );



  return (

    <>

      {NAV_GROUPS.map((group) => {

        const items = group.ids

          .map((id) => navById.get(id))

          .filter((item): item is SuperAdminNavItem => Boolean(item));



        if (items.length === 0) return null;



        return (

          <div key={group.label} className="portal-nav-group">

            {!collapsed ? <span className="portal-nav-group__label">{group.label}</span> : null}

            {items.map((item) => {

              const active = isSuperAdminNavItemActive(pathname, item);

              return (

                <Link

                  key={item.id}

                  href={item.href}

                  className={`eduos-admin-nav-link${active ? " eduos-admin-nav-link--active" : ""}`}

                  title={collapsed ? (item.comingSoon ? `${item.label} (Coming soon)` : item.label) : undefined}

                >

                  <span className="eduos-admin-nav-link__icon">

                    <SuperAdminNavIcon id={item.id} active={active} />

                  </span>

                  <span className="eduos-admin-nav-link__label">

                    {item.label}

                    {item.comingSoon ? <span className="portal-nav-soon">Soon</span> : null}

                  </span>

                </Link>

              );

            })}

          </div>

        );

      })}

    </>

  );

}



export function SuperAdminShell({ title, children }: { title: string; children: ReactNode }) {

  const alerts = useAlertsBanner("/api/super-admin/alerts");

  const pathname = usePathname();

  const router = useRouter();

  const { user, isLoading, logout, refreshUser } = useAuth();

  const { collapsed, toggle, ready } = useSidebarCollapsed();

  const { open: mobileNavOpen, openNav, closeNav } = useMobileNav(pathname);

  const branding = useTenantBranding();



  useEffect(() => {

    if (isLoading) return;

    if (!user) {

      refreshUser();

      return;

    }

    if (user.role !== "super_admin") {

      const id = window.setTimeout(() => router.replace(DASHBOARD_PATH_BY_ROLE[user.role]), 0);

      return () => window.clearTimeout(id);

    }

  }, [isLoading, user, router, refreshUser]);



  async function handleLogout() {

    await logout();

    router.push(AUTH_ROUTES.login);

  }



  if (isLoading || !user || user.role !== "super_admin") {

    return <LoadingScreen />;

  }



  const isCollapsed = ready && collapsed;

  const shellClass = buildPortalShellClass("super-admin", {

    collapsed: isCollapsed,

    mobileNavOpen,

  });

  const initials = userInitials(user.name);

  const institutionLabel = branding?.institutionName ?? null;

  const headerSubtitle = institutionLabel

    ? `Super Admin · ${institutionLabel}`

    : "Super Admin portal";



  return (

    <div className={shellClass}>

      <PortalSidebar
        branding={branding}
        brandSubtitle="Super Admin"

        collapsed={isCollapsed}

        onToggle={toggle}

        nav={<SuperAdminNav collapsed={isCollapsed} />}

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

            <PortalAlertsBanners apiUrl={null} alerts={alerts} />

            {children}

          </div>

        </main>

      </div>



      <PortalNavScrim onClick={closeNav} />

    </div>

  );

}


