import type { ClassBatchSection } from "@eduos/types";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/api";
import { djangoGet } from "@/lib/services/django-client";

interface DjangoBatchRow {
  id: string;
  name: string;
  displayLabel?: string;
  departmentId?: string;
  courseId?: string;
  academicYearId?: string;
}

function toClassSection(b: DjangoBatchRow): ClassBatchSection {
  const label = b.displayLabel ?? b.name;
  const dash = label.lastIndexOf(" - ");
  const grade = dash > 0 ? label.slice(0, dash) : label;
  const section = dash > 0 ? label.slice(dash + 3) : b.name;
  return {
    id: String(b.id),
    label,
    departmentId: String(b.departmentId ?? ""),
    courseId: b.courseId ? String(b.courseId) : undefined,
    grade,
    section,
    academicYearId: b.academicYearId ? String(b.academicYearId) : undefined,
  };
}

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  try {
    const data = await djangoGet<{ batches: DjangoBatchRow[] }>(
      request,
      "/api/v1/academics/batches/",
    );
    const classSections = (data.batches ?? []).map(toClassSection);
    const batches = classSections.map((c) => ({ id: c.id, label: c.label }));
    return NextResponse.json({ batches, classSections });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load classes";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
