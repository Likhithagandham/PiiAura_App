/**
 * Academic year rollover — Django academics API.
 */

import type { RolloverPreview, RolloverState } from "@eduos/types";
import { djangoGet, djangoSend } from "./django-client";

export interface RolloverBundle {
  preview: RolloverPreview;
  state: RolloverState;
}

export async function getRolloverBundle(request: Request): Promise<RolloverBundle> {
  const [preview, state] = await Promise.all([
    djangoSend<RolloverPreview>(request, "/api/v1/academics/rollover/preview/", "POST", {}),
    djangoGet<RolloverState>(request, "/api/v1/academics/rollover/status/"),
  ]);
  return { preview, state };
}

export async function executeRollover(
  request: Request,
  expectedVersion: number,
): Promise<{ async?: boolean; jobId?: string; status?: string; undoExpiresAt?: string | null }> {
  return djangoSend(request, "/api/v1/academics/rollover/execute/", "POST", { expectedVersion });
}

export async function undoRollover(
  request: Request,
  stepUpVerified: boolean,
): Promise<{ status: string }> {
  return djangoSend(
    request,
    "/api/v1/academics/rollover/undo/",
    "POST",
    {},
    stepUpVerified ? { "X-Step-Up-Verified": "true" } : undefined,
  );
}

export async function getRolloverStatus(request: Request): Promise<RolloverState> {
  return djangoGet<RolloverState>(request, "/api/v1/academics/rollover/status/");
}
