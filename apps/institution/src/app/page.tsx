import { AUTH_COOKIE_NAMES, AUTH_ROUTES, DASHBOARD_PATH_BY_ROLE } from "@eduos/constants";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getMe } from "@/lib/services/auth-server";
import { getTenantSubdomain } from "@/lib/tenant";

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAMES.accessToken)?.value;

  if (!token) {
    redirect(AUTH_ROUTES.login);
  }

  const subdomain = await getTenantSubdomain();
  const user = await getMe(token, subdomain);

  if (!user) {
    redirect("/api/auth/invalidate-session");
  }

  redirect(DASHBOARD_PATH_BY_ROLE[user.role]);
}
