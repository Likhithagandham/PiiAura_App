import type { AuditLogDiffLine, AuthUser } from "@eduos/types";
import { getClientIp } from "@/lib/admin/request-meta";
import { djangoSend } from "@/lib/services/django-client";

export type SensitiveMutationInput = {
  action: string;
  entityType: string;
  entityId: string;
  diff?: AuditLogDiffLine[];
};

export function auditDiffLine(
  field: string,
  before: string | number | boolean | null | undefined,
  after: string | number | boolean | null | undefined,
): AuditLogDiffLine {
  const asStr = (v: string | number | boolean | null | undefined) =>
    v === null || v === undefined ? null : String(v);
  return { field, before: asStr(before), after: asStr(after) };
}

/** Record actor, field diff, and client IP for a privileged mutation. */
export function logSensitiveMutation(
  request: Request,
  subdomain: string,
  user: AuthUser,
  input: SensitiveMutationInput,
): void {
  // Fire-and-forget POST to Django audit endpoint
  djangoSend(request, `/api/v1/${subdomain}/audit/log/`, "POST", {
    actorId: user.id,
    actorName: user.name,
    actorRole: user.role,
    ipAddress: getClientIp(request),
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    diff: input.diff ?? [],
  }).catch(() => {
    // Audit logging should not block the calling operation
  });
}
