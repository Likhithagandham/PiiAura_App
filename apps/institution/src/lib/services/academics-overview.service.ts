/**
 * Academics overview — Django backend service.
 *
 * The admin Academics screen consumes the AcademicsData aggregate. The backend
 * endpoint GET /api/v1/academics/admin-overview/ returns that exact camelCase
 * shape, so this is a typed passthrough.
 *
 * (Holiday create/delete already have their own service in academics.service.ts.)
 */

import type { AcademicsData, SubstitutionAvailability } from "@eduos/types";
import { djangoGet, djangoSend } from "./django-client";

export async function getAcademicsData(
  request: Request,
  subdomain: string,
): Promise<AcademicsData> {
  return djangoGet<AcademicsData>(request, "/api/v1/academics/admin-overview/");
}

export async function getAvailableSubstituteFaculty(
  request: Request,
  subdomain: string,
  query: { timetableSlotId: string; date: string },
): Promise<SubstitutionAvailability> {
  const params = new URLSearchParams({
    timetableSlotId: query.timetableSlotId,
    date: query.date,
  });
  return djangoGet<SubstitutionAvailability>(
    request,
    `/api/v1/academics/substitutions/available-faculty/?${params}`,
  );
}

/** Gap-domain actions that have a real backend endpoint (working days, substitutions,
 *  study materials). Other academics actions still route through their own endpoints. */
export const ACADEMICS_GAP_ACTIONS = new Set([
  "set_working_days",
  "create_substitution",
  "cancel_substitution",
  "upload_study_material",
  "delete_study_material",
  "create_study_folder",
  "rename_study_folder",
  "delete_study_folder",
  "save_period",
  "save_department",
  "save_subject",
  "save_class_section",
  "save_timetable_slot",
  "update_syllabus_completion",
  "assign_class_teacher",
  "unassign_class_teacher",
  "assign_subject_teacher",
  "unassign_subject_teacher",
]);

export async function postAcademicsGapAction<T = unknown>(
  request: Request,
  body: Record<string, unknown>,
): Promise<T> {
  return djangoSend<T>(
    request,
    "/api/v1/academics/admin-overview/actions/",
    "POST",
    body,
  );
}

/** Delete/archive actions that map cleanly to an existing CRUD endpoint (id in URL).
 *  Maps action → the path + method to call. */
const DELETE_ENDPOINTS: Record<string, { idKey: string; path: (id: string) => string; method: "DELETE" | "POST" }> = {
  delete_department: { idKey: "departmentId", path: (id) => `/api/v1/academics/departments/${id}/`, method: "DELETE" },
  delete_class_section: { idKey: "classSectionId", path: (id) => `/api/v1/academics/batches/${id}/`, method: "DELETE" },
  delete_subject: { idKey: "subjectId", path: (id) => `/api/v1/academics/subjects/${id}/`, method: "DELETE" },
  delete_holiday: { idKey: "holidayId", path: (id) => `/api/v1/academics/holidays/${id}/`, method: "DELETE" },
  archive_subject: { idKey: "subjectId", path: (id) => `/api/v1/academics/subjects/${id}/archive/`, method: "POST" },
};

export const ACADEMICS_CRUD_ACTIONS = new Set(Object.keys(DELETE_ENDPOINTS));

export async function academicsCrudAction(
  request: Request,
  body: Record<string, unknown>,
): Promise<unknown> {
  const cfg = DELETE_ENDPOINTS[String(body.action)];
  const id = String(body[cfg.idKey] ?? "");
  await djangoSend(request, cfg.path(id), cfg.method, cfg.method === "POST" ? {} : undefined);
  return { ok: true };
}
