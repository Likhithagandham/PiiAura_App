"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Drives the off-canvas portal sidebar on small screens. The drawer auto-closes
 * on navigation, locks body scroll while open, and closes on Escape.
 *
 * Pass the current pathname so the drawer dismisses itself after the user picks
 * a nav item (the shells stay mounted across route changes).
 */
export function useMobileNav(pathname: string) {
  const [open, setOpen] = useState(false);

  const openNav = useCallback(() => setOpen(true), []);
  const closeNav = useCallback(() => setOpen(false), []);
  const toggleNav = useCallback(() => setOpen((prev) => !prev), []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return { open, openNav, closeNav, toggleNav };
}
