import type {
  PublishPlatformAnnouncementInput,
  UpdatePlatformPlanDefinitionInput,
} from "@eduos/types";
import {
  requirePlatformOwner,
  requirePlatformOwnerWrite,
  platformOwnerJson,
} from "@/lib/platform-owner/api";
import * as platformOwnerServer from "@/lib/services/platform-owner-server";

export async function GET(request: Request) {
  const auth = await requirePlatformOwner(request);
  if (!auth.ok) return auth.response;
  try {
    const data = await platformOwnerServer.getSettings(auth.accessToken);
    return platformOwnerJson(auth, data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load settings";
    return platformOwnerJson(auth, { error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const auth = await requirePlatformOwnerWrite(request);
  if (!auth.ok) return auth.response;
  const body = (await request.json()) as
    | UpdatePlatformPlanDefinitionInput
    | { type: "announcement_toggle"; id: string; isActive: boolean };

  try {
    if ("type" in body && body.type === "announcement_toggle") {
      const ann = await platformOwnerServer.setAnnouncementActive(auth.accessToken, body.id, body.isActive);
      return platformOwnerJson(auth, { announcement: ann });
    }

    const plan = await platformOwnerServer.updatePlanDefinition(
      auth.accessToken,
      body as UpdatePlatformPlanDefinitionInput,
    );
    return platformOwnerJson(auth, { plan });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return platformOwnerJson(auth, { error: message }, { status: 400 });
  }
}

export async function POST(request: Request) {
  const auth = await requirePlatformOwnerWrite(request);
  if (!auth.ok) return auth.response;
  try {
    const body = (await request.json()) as PublishPlatformAnnouncementInput;
    const announcement = await platformOwnerServer.publishAnnouncement(auth.accessToken, body);
    return platformOwnerJson(auth, { announcement }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Publish failed";
    return platformOwnerJson(auth, { error: message }, { status: 400 });
  }
}
