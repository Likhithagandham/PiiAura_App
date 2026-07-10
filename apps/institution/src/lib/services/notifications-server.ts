/**
 * User notification preferences — backend.
 */

import type { NotificationPreferences, UpdateNotificationChannelsInput } from "@eduos/types";
import * as authServer from "./auth-server";

export async function getPreferences(
  request: Request,
  accessToken: string,
  subdomain: string,
): Promise<NotificationPreferences> {
  const user = await authServer.getMe(accessToken, subdomain);
  if (!user) throw new Error("Unauthorized");
  return {
    userId: user.id,
    channels: { email: true, sms: false, in_app: true },
  };
}

export async function updatePreferences(
  request: Request,
  accessToken: string,
  subdomain: string,
  channels: UpdateNotificationChannelsInput,
): Promise<NotificationPreferences> {
  const user = await authServer.getMe(accessToken, subdomain);
  if (!user) throw new Error("Unauthorized");
  return {
    userId: user.id,
    channels: { email: true, sms: false, in_app: true, ...channels },
  };
}
