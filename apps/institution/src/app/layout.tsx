import type { Metadata } from "next";
import type { BrandTheme } from "@eduos/types";
import { Inter } from "next/font/google";
import { BrandThemeStyle } from "@/components/BrandThemeStyle";
import { getTenantLoginConfig } from "@/lib/tenant-config";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAMES } from "@eduos/constants";
import { getMeCached } from "@/lib/auth/session";
import { getTenantSubdomain } from "@/lib/tenant";
import { Providers } from "./providers";
import "@eduos/ui/styles/tokens.css";
import "@eduos/ui/styles/globals.css";
import "./globals.css";

/** Google Stitch Institutional Clarity — Inter */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PiiAura — Institution Portal",
  description: "PiiAura institution login and portals",
};

/** Resolve the tenant's brand theme; never let a config/backend hiccup break the app. */
async function resolveTenantTheme(): Promise<BrandTheme | undefined> {
  try {
    const config = await getTenantLoginConfig();
    return config.theme;
  } catch {
    return undefined; // BrandThemeStyle falls back to the built-in defaults.
  }
}

async function getInitialUser(): Promise<import("@eduos/types").AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAMES.accessToken)?.value;
    if (!token) return null;
    const subdomain = await getTenantSubdomain();
    // Shares the 15s getMe cache with the BFF /api/* routes so a full page load
    // doesn't re-validate the same token against Django on every render.
    return await getMeCached(token, subdomain);
  } catch {
    return null;
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [tenantTheme, initialUser] = await Promise.all([
    resolveTenantTheme(),
    getInitialUser(),
  ]);
  const theme = initialUser?.branchTheme ?? tenantTheme;
  return (
    <html
      lang="en"
      className={inter.variable}
      suppressHydrationWarning
    >
      <body className={inter.className}>
        <BrandThemeStyle theme={theme} />
        <Providers initialUser={initialUser}>{children}</Providers>
      </body>
    </html>
  );
}
