import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";
import bundleAnalyzer from "@next/bundle-analyzer";

const configDir = path.dirname(fileURLToPath(import.meta.url));

const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === "true" });

// ── Response-level Cache-Control for BFF API routes ──────────────────────────
// All routes use "private" so browser caches but CDNs/shared caches are excluded.
// stale-while-revalidate allows serving cached content while fetching fresh data.
const PRIVATE = (maxAge: number) =>
  `private, max-age=${maxAge}, stale-while-revalidate=${maxAge * 2}`;

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(configDir, "../.."),
  compress: true,
  // Allow HMR when opening http://127.0.0.1:3000 while the dev server binds as localhost
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  transpilePackages: [
    "@eduos/types",
    "@eduos/constants",
    "@eduos/ui",
    "@eduos/hooks",
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "storage.eduerp.in" },
      { protocol: "https", hostname: "*.s3.amazonaws.com" },
      { protocol: "https", hostname: "*.s3.ap-south-1.amazonaws.com" },
      { protocol: "https", hostname: "*.r2.cloudflarestorage.com" },
      { protocol: "https", hostname: "sandbox-s3.local" },
      { protocol: "https", hostname: "gallery.eduerp.in" },
    ],
  },
  async headers() {
    const cc = (source: string, value: string) => ({
      source,
      headers: [{ key: "Cache-Control", value }],
    });
    return [
      // Dashboard stats — refresh every 60 s
      cc("/api/student/dashboard", PRIVATE(60)),
      cc("/api/faculty/dashboard", PRIVATE(60)),
      cc("/api/admin/dashboard", PRIVATE(60)),
      // Quasi-static curriculum data — refresh every 5 min
      cc("/api/student/timetable", PRIVATE(300)),
      cc("/api/faculty/timetable", PRIVATE(300)),
      cc("/api/student/materials", PRIVATE(300)),
      cc("/api/student/homework", PRIVATE(60)),
      cc("/api/faculty/syllabus", PRIVATE(120)),
      cc("/api/faculty/marks", PRIVATE(60)),
      cc("/api/faculty/notes", PRIVATE(120)),
      // Results published infrequently
      cc("/api/student/results", PRIVATE(120)),
      // Announcements / notices (change daily)
      cc("/api/student/announcements", PRIVATE(60)),
      cc("/api/faculty/announcements", PRIVATE(60)),
      // Never cache auth or financial data
      cc("/api/auth/:path*", "no-store, no-cache"),
      cc("/api/student/fees/:path*", "no-store, no-cache"),
      cc("/api/:path*/fees/:path*", "no-store, no-cache"),
      cc("/api/vitals", "no-store, no-cache"),
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
