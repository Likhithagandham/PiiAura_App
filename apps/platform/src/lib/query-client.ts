/**
 * Shared TanStack Query defaults for the Platform Owner Portal.
 *
 * Mirrors apps/institution/src/lib/query-client.ts exactly: a single
 * QueryClient created once per browser session (in `QueryProvider`), tuned so
 * revisiting a page you already opened renders instantly from cache while a
 * background refetch keeps it fresh.
 */

import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "./api-client";

export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Always revalidate on mount so a page never shows data that could be
        // out of date with the DB — but the cached copy (kept for gcTime) paints
        // INSTANTLY while the background refetch runs (stale-while-revalidate).
        staleTime: 0,
        // Keep unused data in memory for 5 min after a page unmounts, so a
        // later revisit paints instantly then revalidates.
        gcTime: 5 * 60_000,
        // Also refetch when the user returns to the tab, so a dashboard left open
        // picks up DB changes as soon as it's looked at again.
        refetchOnWindowFocus: true,
        retry: (failureCount, error) => {
          // Never retry auth failures — they won't fix themselves.
          if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
            return false;
          }
          return failureCount < 2;
        },
      },
    },
  });
}
