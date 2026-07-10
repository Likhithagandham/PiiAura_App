import { getTenantLoginConfig } from "@/lib/tenant-config";
import { LoginPageClient } from "./LoginPageClient";

export default async function LoginPage() {
  const config = await getTenantLoginConfig();
  return <LoginPageClient initialConfig={config} />;
}
