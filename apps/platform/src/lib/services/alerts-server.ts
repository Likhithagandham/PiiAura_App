/**
 * Alerts — communications backend is not wired yet; return empty.
 */

import type { PortalAlert } from "@eduos/types";

export async function listForPlatform(): Promise<{ alerts: PortalAlert[] }> {
  return Promise.resolve({ alerts: [] });
}
