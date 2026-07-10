import { cache } from "react";
import { unstable_cache } from "next/cache";
import type { TenantLoginConfig } from "@eduos/types";
import * as authServer from "./services/auth-server";
import { getTenantSubdomain } from "./tenant";
import { getDefaultTenantSubdomain } from "./config";

/**
 * Tenant login config (branding, theme, login options) depends only on the tenant
 * subdomain — no per-user data — and changes rarely. It was being fetched fresh from
 * Django on every server render: the root layout resolves the theme AND the login page
 * reads it, so `/login` alone made this ~1.5s round-trip 2–3× per load.
 *
 * Two layers now remove that cost:
 *  - `unstable_cache` caches the Django call per subdomain across requests for 5 min
 *    (same tag as the tenant-branding route, so a branding edit busts both).
 *  - React `cache()` de-dupes it within a single render pass, so the layout + page
 *    share one call.
 */
const getCachedConfig = unstable_cache(
  async (subdomain: string) => authServer.getTenantLoginConfig(subdomain),
  ["tenant-login-config"],
  { revalidate: 300, tags: ["tenant-branding"] },
);

export const getTenantLoginConfig = cache(async (): Promise<TenantLoginConfig> => {
  const subdomain = await getTenantSubdomain();
  try {
    return await getCachedConfig(subdomain);
  } catch {
    // Local dev fail-soft: if the tenant isn't seeded yet (common on localhost),
    // return a minimal config so the app can render and you can log in/seed.
    return {
      institution_name: "PiiAura",
      institution_type: "school",
      logo_url: null,
      theme: undefined,
      subdomain: subdomain || getDefaultTenantSubdomain(),
      student_id_label: "Student ID",
      faculty_id_label: "Faculty ID",
      website: null,
    };
  }
});
