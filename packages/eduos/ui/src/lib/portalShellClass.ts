export type PortalRole =
  | "super-admin"
  | "admin"
  | "faculty"
  | "student"
  | "parent"
  | "platform";

export function buildPortalShellClass(
  role: PortalRole,
  opts: { collapsed?: boolean; mobileNavOpen?: boolean },
): string {
  return [
    "eduos-portal-shell",
    "eduos-portal-shell--polished",
    `eduos-portal-shell--role-${role}`,
    opts.collapsed ? "eduos-portal-shell--sidebar-collapsed" : "",
    opts.mobileNavOpen ? "eduos-portal-shell--mobile-nav-open" : "",
  ]
    .filter(Boolean)
    .join(" ");
}
