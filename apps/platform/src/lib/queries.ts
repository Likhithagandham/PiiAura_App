/**
 * Central query hook for the Platform Owner Portal.
 *
 * Mirrors apps/institution/src/lib/queries.ts's `useApiData` — the workhorse
 * for converting `useEffect`+`fetch` reads. The query key is the full path
 * (including query string), so each distinct URL caches independently and
 * revisiting a page is instant. Pass a null/undefined path (or `enabled:
 * false`) to defer the fetch until inputs are ready. Use the returned
 * `refetch` after a related mutation (matching the institution app's
 * refetch-after-mutation convention, rather than manual cache invalidation).
 */

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { apiGet } from "./api-client";

export function useApiData<T>(
  path: string | null | undefined,
  options?: Partial<Pick<UseQueryOptions<T>, "staleTime" | "gcTime" | "refetchInterval" | "enabled">>,
) {
  const { enabled, ...rest } = options ?? {};
  return useQuery({
    queryKey: ["api", path] as const,
    queryFn: () => apiGet<T>(path as string),
    enabled: path != null && (enabled ?? true),
    ...rest,
  });
}
