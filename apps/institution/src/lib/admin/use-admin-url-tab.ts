"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

export function useAdminUrlTab<T extends string>(
  valid: readonly T[],
  defaultTab: T,
  param = "tab",
): [T, (next: T) => void] {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const tab = useMemo(() => {
    const raw = searchParams.get(param);
    return (valid.includes(raw as T) ? raw : defaultTab) as T;
  }, [searchParams, param, valid, defaultTab]);

  const setTab = useCallback(
    (next: T) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(param, next);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams, param],
  );

  return [tab, setTab];
}
