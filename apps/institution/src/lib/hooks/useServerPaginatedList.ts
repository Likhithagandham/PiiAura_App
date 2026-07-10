"use client";

import { useMemo, useState } from "react";
import type { PaginatedResult } from "@eduos/types";
import { useApiData } from "@/lib/queries";
import { useDebouncedValue } from "./useDebouncedValue";

interface UseServerPaginatedListOptions {
  pageSize?: number;
  /** Extra static/derived query params (e.g. role, branch) merged into every request. */
  params?: Record<string, string | undefined>;
  debounceMs?: number;
  enabled?: boolean;
}

/**
 * Drives a `DataTable` against a BFF route whose response *is* the standard
 * `{count, next, previous, results}` envelope (see `apps/core/pagination.py` on
 * the backend). Manages page state, debounces the search box, and resets to
 * page 1 whenever the search term or any other param changes.
 *
 * For an endpoint that nests the paginated list inside a larger compound
 * response (e.g. the user-management aggregate), build the URL and call
 * `useApiData` directly instead — this hook assumes a flat envelope.
 */
export function useServerPaginatedList<T>(basePath: string | null, options?: UseServerPaginatedListOptions) {
  const pageSize = options?.pageSize ?? 20;
  const debounceMs = options?.debounceMs ?? 300;
  const params = options?.params ?? {};
  const paramsKey = JSON.stringify(params);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, debounceMs);

  // Reset to page 1 whenever search/params change, done during render (not a
  // useEffect) so `page` is already correct in the `url` memo below — an
  // effect-based reset lags one render behind, briefly requesting the old
  // (now out-of-range) page against the new filter and 404ing.
  const resetKey = `${debouncedSearch}|${paramsKey}`;
  const [prevResetKey, setPrevResetKey] = useState(resetKey);
  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey);
    setPage(1);
  }

  const url = useMemo(() => {
    if (!basePath) return null;
    const qs = new URLSearchParams();
    qs.set("page", String(page));
    qs.set("page_size", String(pageSize));
    if (debouncedSearch.trim()) qs.set("search", debouncedSearch.trim());
    for (const [key, value] of Object.entries(params)) {
      if (value != null && value !== "") qs.set(key, value);
    }
    return `${basePath}?${qs.toString()}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basePath, page, pageSize, debouncedSearch, paramsKey]);

  const query = useApiData<PaginatedResult<T>>(url, { enabled: options?.enabled ?? true });

  return {
    ...query,
    page,
    setPage,
    pageSize,
    search,
    setSearch,
    results: query.data?.results ?? [],
    totalCount: query.data?.count ?? 0,
  };
}
