import { bridge } from "@/lib/services/route-bridge";
import { parentJson, requireParent } from "@/lib/parent/api";

export async function GET(request: Request) {
  const auth = await requireParent(request);
  if (!auth.ok) return auth.response;

  const [access, children] = await Promise.all([
    bridge<{ allowed: boolean; reason?: string }>(request, {
      path: "/api/v1/parent/portal-access/",
    }),
    bridge<unknown[]>(request, {
      path: "/api/v1/parent/children/",
    }),
  ]);
  return parentJson(auth, { children, access });
}
