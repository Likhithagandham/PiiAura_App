import { bridge } from "@/lib/services/route-bridge";
import { NextResponse } from "next/server";
import { auditDiffLine, logSensitiveMutation } from "@/lib/admin/audit-log";
import { requireAdmin } from "@/lib/admin/api";
import * as adminServer from "@/lib/services/admin-server";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  try {
    const data = await adminServer.getSettings(request, auth.subdomain);
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load settings";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json()) as {
    section?: string;
    data?: Record<string, unknown>;
  };

  const { subdomain, user } = auth;
  const section = String(body.section ?? "");

  switch (section) {
    case "institution": {
      const updated = await bridge(request, {
        path: "/api/v1/admin/settings/institution/",
        method: "PATCH",
        body: body.data,
      });
      logSensitiveMutation(request, subdomain, user, {
        action: "settings.institution.update",
        entityType: "settings",
        entityId: subdomain,
        diff: [auditDiffLine("section", null, "institution")],
      });
      return NextResponse.json(updated);
    }
    case "integrations": {
      const updated = await bridge(request, {
        path: "/api/v1/admin/settings/integrations/",
        method: "PATCH",
        body: body.data,
      });
      logSensitiveMutation(request, subdomain, user, {
        action: "settings.integrations.update",
        entityType: "settings",
        entityId: subdomain,
        diff: [auditDiffLine("section", null, "integrations")],
      });
      return NextResponse.json(updated);
    }
    case "academic-year-current": {
      const yearId = String(body.data?.yearId ?? "");
      const updated = await bridge(request, {
        path: "/api/v1/admin/settings/academic-year/current/",
        method: "PATCH",
        body: body.data,
      });
      logSensitiveMutation(request, subdomain, user, {
        action: "settings.academic_year.set_current",
        entityType: "academic_year",
        entityId: yearId,
        diff: [auditDiffLine("currentYearId", null, yearId)],
      });
      return NextResponse.json(updated);
    }
    case "academic-year-create": {
      const label = String(body.data?.label ?? "");
      const updated = await bridge(request, {
        path: "/api/v1/admin/settings/academic-year/",
        method: "POST",
        body: body.data,
      });
      logSensitiveMutation(request, subdomain, user, {
        action: "settings.academic_year.create",
        entityType: "academic_year",
        entityId: label,
        diff: [
          auditDiffLine("startDate", null, String(body.data?.startDate ?? "")),
          auditDiffLine("endDate", null, String(body.data?.endDate ?? "")),
        ],
      });
      return NextResponse.json(updated);
    }
    case "feature-toggle": {
      const toggleId = String(body.data?.toggleId ?? "");
      const enabled = Boolean(body.data?.enabled);
      const settings = await adminServer.getSettings(request, subdomain);
      const before = settings.featureToggles.find((t) => t.id === toggleId)?.enabled;
      const updated = await bridge(request, {
        path: "/api/v1/admin/settings/feature-toggle/",
        method: "PATCH",
        body: body.data,
      });
      logSensitiveMutation(request, subdomain, user, {
        action: "settings.feature_toggle.update",
        entityType: "feature_toggle",
        entityId: toggleId,
        diff: [auditDiffLine("enabled", before, enabled)],
      });
      return NextResponse.json(updated);
    }
    case "attendance-rules": {
      const updated = await adminServer.updateAttendanceSettings(request, subdomain, {
        attendanceThresholdPercent: body.data?.thresholdPercent,
        examDayCountsTowardAttendance: body.data?.examDayCountsTowardThreshold,
      });
      logSensitiveMutation(request, subdomain, user, {
        action: "settings.attendance_rules.update",
        entityType: "settings",
        entityId: subdomain,
        diff: [auditDiffLine("section", null, "attendance-rules")],
      });
      return NextResponse.json(updated);
    }
    case "institution-type": {
      const current = await adminServer.getSettings(request, subdomain);
      const before = current.institutionType;
      const next = body.data?.institutionType === "college" ? "college" : "school";
      if (before !== next) {
        logSensitiveMutation(request, subdomain, user, {
          action: "settings.institution_type.update",
          entityType: "settings",
          entityId: subdomain,
          diff: [auditDiffLine("institutionType", before, next)],
        });
      }
      // Branch-admin scope toggle is UI-only until a dedicated admin settings API exists.
      return NextResponse.json({ institutionType: next });
    }
    default:
      return NextResponse.json({ error: "Unknown section" }, { status: 400 });
  }
}
