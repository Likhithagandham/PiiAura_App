import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function useSuperAdminUrlTab<T extends string>(
  valid: readonly T[],
  defaultTab: T,
  param = "tab",
): [T, (next: T) => void] {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const validSet = useMemo(() => new Set(valid as readonly string[]), [valid]);

  const initial = (params.get(param) as T | null) ?? defaultTab;
  const [tab, setTab] = useState<T>(validSet.has(initial) ? initial : defaultTab);

  useEffect(() => {
    const raw = (params.get(param) as T | null) ?? defaultTab;
    const next = validSet.has(raw) ? raw : defaultTab;
    setTab(next);
  }, [params, validSet, defaultTab, param]);

  const set = useCallback(
    (next: T) => {
      const sp = new URLSearchParams(params.toString());
      sp.set(param, next);
      router.replace(`${pathname}?${sp.toString()}`);
    },
    [params, pathname, router, param],
  );

  return [tab, set];
}

