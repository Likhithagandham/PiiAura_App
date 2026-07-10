import { NextResponse } from "next/server";
import { requireSuperAdmin, superAdminJson } from "@/lib/super-admin/api";
import { DjangoApiError } from "@/lib/services/django-client";
import * as usersSvc from "@/lib/services/users.service";
import { mapSuperAdminError } from "../../errors";

export async function PATCH(request: Request) {
  const auth = await requireSuperAdmin(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json()) as { action: string; userId: string; payload?: unknown };
  const entityId = String(body.userId ?? "");

  try {
    let result: unknown;
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
          body.payload as import("@eduos/types").UpdateUserInput,
        );
        break;
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
    return superAdminJson(auth, result);
  } catch (err) {
    if (err instanceof DjangoApiError) {
      return NextResponse.json(
        { error: err.message, ...(err.fieldErrors ?? {}) },
        { status: err.status || 400 },
      );
    }
    const { message, status } = mapSuperAdminError(err);
    return superAdminJson(auth, { error: message }, { status });
  }
}
