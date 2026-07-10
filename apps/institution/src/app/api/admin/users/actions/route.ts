import { NextResponse } from "next/server";
import { auditDiffLine, logSensitiveMutation } from "@/lib/admin/audit-log";
import { requireAdmin } from "@/lib/admin/api";
import { withIdempotency } from "@/lib/admin/idempotency";
import { DjangoApiError } from "@/lib/services/django-client";
import * as usersSvc from "@/lib/services/users.service";

const AUDIT: Record<string, { action: string; diff: () => ReturnType<typeof auditDiffLine>[] }> = {
  send_invite: { action: "users.invite.send", diff: () => [auditDiffLine("inviteSent", null, "true")] },
  deactivate: { action: "users.deactivate", diff: () => [auditDiffLine("active", "true", "false")] },
  activate: { action: "users.activate", diff: () => [auditDiffLine("active", "false", "true")] },
  reset_password: { action: "users.password.reset", diff: () => [auditDiffLine("passwordReset", null, "issued")] },
  hard_delete_student: { action: "users.student.hard_delete", diff: () => [auditDiffLine("deleted", "false", "true")] },
  promote_student_to_faculty: { action: "users.promote_student_to_faculty", diff: () => [auditDiffLine("role", "student", "faculty")] },
  update_user: { action: "users.update", diff: () => [auditDiffLine("updated", null, "true")] },
};

export async function PATCH(request: Request) {
  return withIdempotency(request, async () => {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    const body = (await request.json()) as { action: string; userId: string };
    const { subdomain } = auth;
    const entityId = String(body.userId ?? "");

    try {
      let result: unknown;

      // Real backend — the dues check is enforced server-side for hard_delete.
      switch (body.action) {
        case "send_invite":
          result = await usersSvc.sendInvite(request, entityId);
          break;
        case "deactivate":
          result = await usersSvc.deactivateUser(request, entityId);
          break;
        case "activate":
          result = await usersSvc.activateUser(request, entityId);
          break;
        case "reset_password":
          result = await usersSvc.resetPassword(request, entityId);
          break;
        case "hard_delete_student":
          result = await usersSvc.hardDeleteStudent(request, entityId);
          break;
        case "promote_student_to_faculty":
          result = await usersSvc.promoteStudentToFaculty(request, entityId);
          break;
        case "update_user":
          result = await usersSvc.updateUser(
            request,
            entityId,
            (body as { payload?: import("@eduos/types").UpdateUserInput }).payload as import("@eduos/types").UpdateUserInput,
          );
          break;
        default:
          return NextResponse.json({ error: "Unknown action" }, { status: 400 });
      }

      const audit = AUDIT[body.action];
      if (audit) {
        logSensitiveMutation(request, subdomain, auth.user, {
          action: audit.action,
          entityType: "user",
          entityId,
          diff: audit.diff(),
        });
      }
      return NextResponse.json(result);
    } catch (err) {
      if (err instanceof DjangoApiError) {
        // Surface structured backend errors (e.g. open_fee_dues) to the client.
        return NextResponse.json(
          { error: err.message, ...(err.fieldErrors ?? {}) },
          { status: err.status === 401 ? 401 : err.status || 400 },
        );
      }
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Request failed" },
        { status: 400 },
      );
    }
  });
}
