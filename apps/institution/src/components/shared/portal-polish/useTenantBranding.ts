"use client";

import type { TenantBranding } from "@eduos/types";
import { useTenantBrandingQuery } from "@/lib/queries";

/**
 * Tenant branding, cached across the whole session by TanStack Query.
 *
 * Kept as a thin wrapper (returning `TenantBranding | null`) so existing callers
 * don't change. The old hand-rolled module singleton is gone — the query cache
 * now dedupes concurrent callers and serves revisits instantly.
 */
export function useTenantBranding(): TenantBranding | null {
  const { data } = useTenantBrandingQuery();
  return data ?? null;
}
