import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import { cookies } from "next/headers";
import { PLATFORM_AUTH_COOKIE_NAMES } from "@eduos/constants";
import * as platformAuthServer from "@/lib/services/platform-auth-server";
import "@eduos/ui/styles/tokens.css";
import "@eduos/ui/styles/globals.css";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PiiAura — Platform Owner",
  description: "PiiAura platform owner console",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let initialUser = null;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(PLATFORM_AUTH_COOKIE_NAMES.accessToken)?.value;
    if (token) {
      initialUser = await platformAuthServer.getMe(token);
    }
  } catch (err) {
    // console.error(err);
  }

  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className={inter.className}>
        <Providers initialUser={initialUser}>{children}</Providers>
      </body>
    </html>
  );
}
