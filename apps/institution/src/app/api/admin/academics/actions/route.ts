import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/api";
import { withIdempotency } from "@/lib/admin/idempotency";
import {
  ACADEMICS_CRUD_ACTIONS,
  ACADEMICS_GAP_ACTIONS,
  academicsCrudAction,
  postAcademicsGapAction,
} from "@/lib/services/academics-overview.service";

class TimetableClashError extends Error {
  clashes: unknown;
  constructor(message: string, clashes: unknown) {
    super(message);
    this.name = "TimetableClashError";
    this.clashes = clashes;
  }
}

class SubjectHasMarksError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SubjectHasMarksError";
  }
}

export async function PATCH(request: Request) {
  return withIdempotency(request, async () => {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    const body = (await request.json()) as {
      action: string;
      [key: string]: unknown;
    };

    try {
      // Gap-domain actions (working days, substitutions, study materials).
      if (ACADEMICS_GAP_ACTIONS.has(body.action)) {
        const result = await postAcademicsGapAction(request, body);
        return NextResponse.json(result);
      }
      // Clean delete/archive actions → existing CRUD endpoints.
      if (ACADEMICS_CRUD_ACTIONS.has(body.action)) {
        return NextResponse.json(await academicsCrudAction(request, body));
      }

      return NextResponse.json(
        { error: `${body.action} is not available on the real backend yet.` },
        { status: 501 },
      );
    } catch (err) {
      if (err instanceof TimetableClashError) {
        return NextResponse.json({ clashes: err.clashes, error: err.message }, { status: 409 });
      }
      if (err instanceof SubjectHasMarksError) {
        return NextResponse.json({ error: err.message, hasMarks: true }, { status: 409 });
      }
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Request failed" },
        { status: 400 },
      );
    }
  });
}
