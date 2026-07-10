"use client";

import { useEffect, useRef, useState } from "react";

export function PlatformUserFooter({
  name,
  initials,
  collapsed,
  onLogout,
}: {
  name: string;
  initials: string;
  collapsed: boolean;
  onLogout: () => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function handleLogout() {
    setOpen(false);
    await onLogout();
  }

  return (
    <div
      className={`eduos-portal-sidebar__user-root${collapsed ? " eduos-portal-sidebar__user-root--collapsed" : ""}`}
      ref={rootRef}
    >
      <button
        type="button"
        className={`eduos-portal-sidebar__user eduos-portal-sidebar__user-trigger${
          collapsed ? " eduos-portal-sidebar__user--collapsed eduos-portal-sidebar__user-trigger--collapsed" : ""
        }${open ? " eduos-portal-sidebar__user-trigger--open" : ""}`}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        title={collapsed ? name : undefined}
      >
        <div className="eduos-portal-sidebar__avatar">{initials}</div>
        {!collapsed ? <div className="eduos-portal-sidebar__user-name">{name}</div> : null}
      </button>
      {open ? (
        <div className="eduos-portal-sidebar__user-menu" role="menu">
          {!collapsed ? (
            <div className="eduos-portal-sidebar__user-menu-label">{name}</div>
          ) : null}
          <button
            type="button"
            role="menuitem"
            className="eduos-portal-sidebar__user-menu-item eduos-portal-sidebar__user-menu-item--danger"
            onClick={() => void handleLogout()}
          >
            Logout
          </button>
        </div>
      ) : null}
    </div>
  );
}
