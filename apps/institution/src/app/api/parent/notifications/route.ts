import { bridge } from "@/lib/services/route-bridge";
import type { UpdateNotificationChannelsInput } from "@eduos/types";
import { parentJson, requireParent } from "@/lib/parent/api";

export async function GET(request: Request) {
  const auth = await requireParent(request);
  if (!auth.ok) return auth.response;
  const data = await bridge(request, {
    path: "/api/v1/parent/notification-preferences/",
  });
  return parentJson(auth, data);
}

export async function PATCH(request: Request) {
  const auth = await requireParent(request);
  if (!auth.ok) return auth.response;
  const body = (await request.json()) as { channels?: UpdateNotificationChannelsInput };
  try {
    const data = await bridge(request, {
      path: "/api/v1/parent/notification-preferences/",
      method: "PATCH",
      body: body.channels ?? {},
    });
    return parentJson(auth, data);
  } catch (err) {
    return parentJson(auth, { error: err instanceof Error ? err.message : "Failed" }, { status: 400 });
  }
}
