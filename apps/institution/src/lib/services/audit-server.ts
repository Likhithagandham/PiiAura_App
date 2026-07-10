/**
 * Admin audit log — Django analytics API.
 */

import type { AuditLogEntry } from "@eduos/types";
import { djangoGet } from "./django-client";

interface DjangoAuditRow {
  id: string;
  actorUserId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  diff?: { field: string; before?: string | null; after?: string | null }[];
  ipAddress?: string | null;
  createdAt: string;
}

function mapEntry(row: DjangoAuditRow): AuditLogEntry {
  const diff = (row.diff ?? []).map((d) => ({
    field: d.field,
    before: d.before ?? null,
    after: d.after ?? null,
  }));
  return {
    id: row.id,
    at: row.createdAt,
    actorId: row.actorUserId ?? "system",
    actorName: row.actorUserId ? "Staff" : "System",
    actorRole: "admin",
    action: row.action,
    entityType: row.entityType,
    entityId: row.entityId,
    ipAddress: row.ipAddress ?? "—",
    diff,
  };
}

export async function listAuditEntries(request: Request, limit = 100): Promise<AuditLogEntry[]> {
  const data = await djangoGet<{ audit: DjangoAuditRow[] }>(
    request,
    `/api/v1/analytics/audit/?limit=${limit}`,
  );
  return (data.audit ?? []).map(mapEntry);
}
