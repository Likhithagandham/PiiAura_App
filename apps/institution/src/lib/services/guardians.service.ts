/**
 * Guardian-links service — real Django backend.
 *
 * The admin Users → Guardian links tab consumes GuardianManagementData. The backend
 * endpoint GET /api/v1/auth/guardians/overview/ returns that exact camelCase shape.
 */

import type { GuardianManagementData, SaveGuardianLinkInput } from "@eduos/types";
import { djangoGet, djangoSend } from "./django-client";

const ACTIONS = "/api/v1/auth/guardians/actions/";

export async function getGuardianData(
  request: Request,
  subdomain: string,
  branchQuery?: string | null,
  classQuery?: string | null,
): Promise<GuardianManagementData> {
  const params = new URLSearchParams();
  params.set("branch", branchQuery ?? "all");
  if (classQuery) {
    params.set("class", classQuery);
  }
  return djangoGet<GuardianManagementData>(
    request,
    `/api/v1/auth/guardians/overview/?${params.toString()}`,
  );
}

export function saveGuardianLink(request: Request, payload: SaveGuardianLinkInput) {
  return djangoSend(request, ACTIONS, "POST", { action: "save_link", payload });
}

export function removeGuardianLink(request: Request, linkId: string) {
  return djangoSend(request, ACTIONS, "POST", { action: "remove_link", linkId });
}

export function setGuardianPrimary(request: Request, linkId: string) {
  return djangoSend(request, ACTIONS, "POST", { action: "set_primary", linkId });
}
