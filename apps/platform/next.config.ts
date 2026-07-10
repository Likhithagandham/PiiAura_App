import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";
import bundleAnalyzer from "@next/bundle-analyzer";

const configDir = path.dirname(fileURLToPath(import.meta.url));

const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === "true" });

const PRIVATE = (maxAge: number) =>
  `private, max-age=${maxAge}, stale-while-revalidate=${maxAge * 2}`;

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(configDir, "../.."),
  compress: true,
  // Next.js 16 blocks HMR from 127.0.0.1 by default; allow both local hostnames.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  transpilePackages: [
    "@eduos/types",
    "@eduos/constants",
    "@eduos/ui",
    "@eduos/hooks",
  ],
  async headers() {
    const cc = (source: string, value: string) => ({
      source,
      headers: [{ key: "Cache-Control", value }],
    });
    return [
      cc("/api/platform-owner/dashboard", PRIVATE(60)),
      cc("/api/platform-owner/analytics", PRIVATE(120)),
      // No browser Cache-Control on tenants or plans: both pages mutate then
      // refetch (activate/deactivate; plan edits), and a private/max-age
      // header would let the browser serve stale data for up to N seconds
      // right after the page's own write. TanStack Query (staleTime: 0)
      // already owns client-side staleness for these routes.
      cc("/api/platform-owner/alerts", PRIVATE(120)),
      cc("/api/auth/:path*", "no-store, no-cache"),
      cc("/api/vitals", "no-store, no-cache"),
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
