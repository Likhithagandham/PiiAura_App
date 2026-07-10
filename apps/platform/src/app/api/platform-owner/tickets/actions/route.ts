import type { PlatformTicketActionInput } from "@eduos/types";
import { requirePlatformOwnerWrite, platformOwnerJson } from "@/lib/platform-owner/api";
import * as platformOwnerServer from "@/lib/services/platform-owner-server";

export async function PATCH(request: Request) {
  const auth = await requirePlatformOwnerWrite(request);
  if (!auth.ok) return auth.response;
  const body = (await request.json()) as PlatformTicketActionInput;
  if (!body.tenantSubdomain || !body.ticketId || !body.action) {
    return platformOwnerJson(
      auth,
      { error: "tenantSubdomain, ticketId, and action are required" },
      { status: 400 },
    );
  }
  try {
    const ticket = await platformOwnerServer.applyTicketAction(auth.accessToken, body);
    return platformOwnerJson(auth, { ticket });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Action failed";
    return platformOwnerJson(auth, { error: message }, { status: 400 });
  }
}
