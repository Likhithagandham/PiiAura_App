import type { AssignClassTeacherInput, SaveHomeworkInput } from "@eduos/types";
import { NextResponse } from "next/server";
import { auditDiffLine, logSensitiveMutation } from "@/lib/admin/audit-log";
import { requireAdmin } from "@/lib/admin/api";
import { withIdempotency } from "@/lib/admin/idempotency";
import { DjangoApiError } from "@/lib/services/django-client";
import {
  assignClassTeacher,
  deleteHomework,
  saveHomework,
  unassignClassTeacher,
} from "@/lib/services/school-server";

export async function PATCH(request: Request) {
  return withIdempotency(request, async () => {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    const body = (await request.json()) as { action?: string; payload?: unknown; [k: string]: unknown };
    const action = String(body.action ?? "");

    try {
      switch (action) {
        case "assign_class_teacher": {
          const payload = body.payload as AssignClassTeacherInput;
          const result = await assignClassTeacher(request, auth.subdomain, payload);
          logSensitiveMutation(request, auth.subdomain, auth.user, {
            action: "school.class_teacher.assign",
            entityType: "class_section",
            entityId: payload.classSectionId,
            diff: [auditDiffLine("teacherUserId", null, payload.teacherUserId)],
          });
          return NextResponse.json(result);
        }
        case "unassign_class_teacher": {
          const classSectionId = String((body.payload as { classSectionId?: string })?.classSectionId ?? "");
          await unassignClassTeacher(request, auth.subdomain, classSectionId);
          logSensitiveMutation(request, auth.subdomain, auth.user, {
            action: "school.class_teacher.unassign",
            entityType: "class_section",
            entityId: classSectionId,
            diff: [auditDiffLine("teacherUserId", null, null)],
          });
          return NextResponse.json({ ok: true });
        }
        case "save_homework": {
          const payload = body.payload as SaveHomeworkInput;
          const result = await saveHomework(request, auth.subdomain, payload);
          logSensitiveMutation(request, auth.subdomain, auth.user, {
            action: payload.id ? "school.homework.update" : "school.homework.create",
            entityType: "homework",
            entityId: result.id,
            diff: [auditDiffLine("title", null, result.title)],
          });
          return NextResponse.json(result);
        }
        case "delete_homework": {
          const id = String((body.payload as { id?: string })?.id ?? "");
          await deleteHomework(request, auth.subdomain, id);
          logSensitiveMutation(request, auth.subdomain, auth.user, {
            action: "school.homework.delete",
            entityType: "homework",
            entityId: id,
            diff: [],
          });
          return NextResponse.json({ ok: true });
        }
        default:
          return NextResponse.json({ error: "Unknown action" }, { status: 400 });
      }
    } catch (err) {
      if (err instanceof DjangoApiError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Request failed" },
        { status: 400 },
      );
    }
  });
}
