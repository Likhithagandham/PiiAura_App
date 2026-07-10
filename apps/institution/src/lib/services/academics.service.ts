/**
 * Academics service — holidays via Django backend.
 *
 * First wired slice: HOLIDAYS (admin/holidays route handler). The backend models a holiday
 * as { holidayType, appliesTo } while the frontend uses { scope, classIds, blocksAttendance };
 * the mapping below is the single place that reconciles the two shapes.
 */

import type { CreateHolidayInput, Holiday } from "@eduos/types";
import { djangoGet, djangoSend } from "./django-client";

interface DjangoHoliday {
  id: string;
  date: string;
  name: string;
  holidayType: string;
  appliesTo: { all?: boolean; batchIds?: string[] } | null;
  version: number;
}

interface DjangoBatch {
  id: string;
  name: string;
  displayLabel?: string;
}

type ClassOption = { id: string; label: string };

/** Backend holiday → frontend Holiday. */
function mapHoliday(h: DjangoHoliday): Holiday {
  const applies = h.appliesTo ?? {};
  const isInstitutionWide = applies.all === true || !applies.batchIds?.length;
  return {
    id: h.id,
    name: h.name,
    date: h.date,
    scope: isInstitutionWide ? "institution" : "classes",
    classIds: applies.batchIds ?? [],
    // Holidays block attendance marking on that day (EC-ATT-01).
    blocksAttendance: true,
    createdAt: "", // backend list serializer doesn't expose created_at; UI tolerates empty.
  };
}

/** Frontend create input → backend create body. */
function toDjangoCreateBody(input: CreateHolidayInput) {
  return {
    date: input.date,
    name: input.name,
    holidayType: "public",
    appliesTo:
      input.scope === "institution"
        ? { all: true }
        : { batchIds: input.classIds ?? [] },
  };
}

// ── Public API (route handlers call these) ───────────────────────────────────

export async function getHolidaysView(
  request: Request,
  subdomain: string,
): Promise<{ holidays: Holiday[]; classOptions: ClassOption[] }> {
  const [holidayRes, batchRes] = await Promise.all([
    djangoGet<{ holidays: DjangoHoliday[] }>(request, "/api/v1/academics/holidays/"),
    djangoGet<{ batches: DjangoBatch[] }>(request, "/api/v1/academics/batches/"),
  ]);
  const holidays = holidayRes.holidays ?? [];
  const batches = batchRes.batches ?? [];
  return {
    holidays: holidays.map(mapHoliday),
    classOptions: batches.map((b) => ({
      id: String(b.id),
      label: b.displayLabel ?? b.name,
    })),
  };
}

export async function createHoliday(
  request: Request,
  subdomain: string,
  input: CreateHolidayInput,
): Promise<Holiday> {
  const created = await djangoSend<{ holiday: DjangoHoliday }>(
    request,
    "/api/v1/academics/holidays/",
    "POST",
    toDjangoCreateBody(input),
  );
  return mapHoliday(created.holiday ?? (created as unknown as DjangoHoliday));
}

export async function deleteHoliday(
  request: Request,
  subdomain: string,
  id: string,
): Promise<boolean> {
  // djangoSend throws on non-2xx; reaching here means the delete succeeded.
  await djangoSend<unknown>(request, `/api/v1/academics/holidays/${id}/`, "DELETE");
  return true;
}
