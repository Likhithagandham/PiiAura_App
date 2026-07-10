/**
 * School (Class & diary) service twin — real Django backend.
 */

import type {
  AssignClassTeacherInput,
  ClassTeacherAssignment,
  DailyHomeworkEntry,
  SaveHomeworkInput,
  SchoolOnlyData,
} from "@eduos/types";
import { djangoGet, djangoSend } from "./django-client";

export async function getSchoolData(
  request: Request,
  subdomain: string,
): Promise<SchoolOnlyData> {
  return djangoGet<SchoolOnlyData>(request, "/api/v1/coursework/admin/school-overview/");
}

export async function assignClassTeacher(
  request: Request,
  subdomain: string,
  input: AssignClassTeacherInput,
): Promise<ClassTeacherAssignment> {
  await djangoSend(request, `/api/v1/academics/batches/${input.classSectionId}/`, "PATCH", {
    classTeacherId: input.teacherUserId,
  });
  const data = await getSchoolData(request, subdomain);
  const row = data.classTeachers.find((a) => a.classSectionId === input.classSectionId);
  if (!row) throw new Error("Class teacher assignment failed.");
  return row;
}

export async function unassignClassTeacher(
  request: Request,
  subdomain: string,
  classSectionId: string,
): Promise<void> {
  await djangoSend(request, `/api/v1/academics/batches/${classSectionId}/`, "PATCH", {
    classTeacherId: null,
  });
}

export async function saveHomework(
  request: Request,
  subdomain: string,
  input: SaveHomeworkInput,
): Promise<DailyHomeworkEntry> {
  const res = await djangoSend<{ success: boolean; entry: DailyHomeworkEntry }>(
    request,
    "/api/v1/coursework/me/homework/",
    "POST",
    {
      id: input.id,
      classSectionId: input.classSectionId,
      date: input.date,
      title: input.title,
      details: input.details,
      publish: input.publish ?? false,
    },
  );
  return res.entry;
}

export async function deleteHomework(
  request: Request,
  subdomain: string,
  id: string,
): Promise<void> {
  await djangoSend(request, `/api/v1/coursework/me/homework/${id}/`, "DELETE");
}
