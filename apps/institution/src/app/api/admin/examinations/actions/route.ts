import {
  autoAssignInvigilators,
  confirmPublish,
  deleteSlot,
  exportReportCardPdf,
  exportClassResultsCsv,
  exportSeatingCsv,
  generateSeating,
  generateSeatingBulk,
  getAnalytics,
  loadSlotMarks,
  manageInvigilator,
  preflightResults,
  preflightSeating,
  reviseResult,
  saveMarks,
  saveSlot,
  startPublish,
  submitSlotMarks,
  updateRequiredInvigilators,
} from "@/lib/services/examinations-server";
import type { SaveExamSlotInput } from "@eduos/types";
import { NextResponse } from "next/server";
import { auditDiffLine, logSensitiveMutation } from "@/lib/admin/audit-log";
import { requireAdmin } from "@/lib/admin/api";
import { getClientIp } from "@/lib/admin/request-meta";
import { withIdempotency } from "@/lib/admin/idempotency";
import { DjangoApiError } from "@/lib/services/django-client";

const COLLEGE_ONLY_ACTIONS = new Set([
  "hall_ticket",
  "override_internal_mark",
  "update_results_config",
  "update_grace_marks",
  "list_arrears",
  "schedule_arrear",
  "export_marksheet",
  "export_transcript",
]);

export async function PATCH(request: Request) {
  return withIdempotency(request, async () => {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    const body = (await request.json()) as { action: string; [key: string]: unknown };
    const { subdomain, user } = auth;

    if (COLLEGE_ONLY_ACTIONS.has(body.action)) {
      return NextResponse.json({ error: "This action is not available for school examinations." }, { status: 403 });
    }

    try {
      switch (body.action) {
        case "save_slot": {
          const result = await saveSlot(request, subdomain, body.payload as SaveExamSlotInput);
          return NextResponse.json(result);
        }
        case "delete_slot": {
          const slotId = String(body.slotId);
          await deleteSlot(request, slotId);
          logSensitiveMutation(request, subdomain, user, {
            action: "examinations.slot.delete",
            entityType: "exam_slot",
            entityId: slotId,
            diff: [],
          });
          return NextResponse.json({ ok: true });
        }
        case "generate_seating": {
          const plan = await generateSeating(request, subdomain, String(body.examSlotId));
          return NextResponse.json(plan);
        }
        case "preflight_seating":
          return NextResponse.json(
            await preflightSeating(
              request,
              Array.isArray(body.examSlotIds) ? body.examSlotIds.map(String) : [],
            ),
          );
        case "generate_seating_bulk":
          return NextResponse.json(
            await generateSeatingBulk(request, subdomain, {
              examSlotIds: Array.isArray(body.examSlotIds)
                ? body.examSlotIds.map(String)
                : undefined,
              mode: body.mode as "per_slot" | "combined" | undefined,
              seatingOrder: body.seatingOrder as "random" | "alphabetical" | undefined,
              roomIds: Array.isArray(body.roomIds) ? body.roomIds.map(String) : undefined,
              hallRoomId: body.hallRoomId == null ? undefined : String(body.hallRoomId),
            }),
          );
        case "export_seating_csv": {
          const examSlotIds = (body.examSlotIds as string[]) ?? [];
          if (examSlotIds.length === 0) {
            return NextResponse.json({ error: "No seating plans to export." }, { status: 400 });
          }
          const csv = await exportSeatingCsv(request, examSlotIds);
          return new NextResponse(csv, {
            headers: {
              "Content-Type": "text/csv",
              "Content-Disposition": 'attachment; filename="seating-plans.csv"',
            },
          });
        }
        case "auto_invigilators":
          return NextResponse.json(await autoAssignInvigilators(request));
        case "assign_invigilator":
          return NextResponse.json(
            await manageInvigilator(request, {
              examSlotId: String(body.examSlotId),
              facultyId: String(body.facultyId),
              mode: (body.mode as "add" | "replace" | "remove") ?? "add",
              replaceFacultyId:
                body.replaceFacultyId == null ? undefined : String(body.replaceFacultyId),
            }),
          );
        case "update_required_invigilators":
          return NextResponse.json(
            await updateRequiredInvigilators(request, {
              examSlotId: String(body.examSlotId),
              requiredInvigilators: Number(body.requiredInvigilators),
            }),
          );
        case "load_slot_marks": {
          const entries = await loadSlotMarks(request, subdomain, String(body.examSlotId));
          return NextResponse.json({ entries });
        }
        case "save_marks": {
          const examSlotId = String(body.examSlotId);
          const studentId = String(body.studentId);
          const marks = body.marks == null ? null : Number(body.marks);
          const result = await saveMarks(
            request,
            subdomain,
            {
              examSlotId,
              studentId,
              marks,
              override: Boolean(body.override),
              overrideReason: body.overrideReason == null ? undefined : String(body.overrideReason),
            },
            {
              actorId: user.id,
              actorName: user.name,
              ipAddress: getClientIp(request),
            },
          );
          const entries = Array.isArray(result) ? result : [result];
          return NextResponse.json({ entries });
        }
        case "submit_slot_marks": {
          const result = await submitSlotMarks(request, String(body.examSlotId), {
            override: Boolean(body.override),
            overrideReason: body.overrideReason == null ? undefined : String(body.overrideReason),
          });
          return NextResponse.json(result);
        }
        case "preflight_results":
          return NextResponse.json(
            await preflightResults(request, String(body.examSlotId ?? (Array.isArray(body.examSlotIds) ? body.examSlotIds[0] : undefined) ?? "")),
          );
        case "start_publish":
          return NextResponse.json(
            await startPublish(request, subdomain, String(body.examSlotId)),
          );
        case "confirm_publish": {
          const examSlotId = String(body.examSlotId);
          const result = await confirmPublish(request, subdomain, {
            examSlotId,
            token: String(body.token),
            note: body.note == null ? undefined : String(body.note),
            publishedByUserId: user.id,
          });
          logSensitiveMutation(request, subdomain, user, {
            action: "examinations.results.publish",
            entityType: "exam_slot",
            entityId: examSlotId,
            diff: [auditDiffLine("published", null, "true")],
          });
          return NextResponse.json(result);
        }
        case "revise_result": {
          const examSlotId = String(body.examSlotId);
          const result = await reviseResult(request, subdomain, {
            examSlotId,
            note: String(body.note ?? ""),
            revisedByUserId: user.id,
          });
          logSensitiveMutation(request, subdomain, user, {
            action: "examinations.results.revise",
            entityType: "exam_slot",
            entityId: examSlotId,
            diff: [auditDiffLine("note", null, String(body.note ?? ""))],
          });
          return NextResponse.json(result);
        }
        case "analytics":
          return NextResponse.json(
            await getAnalytics(request, subdomain, String(body.examSlotId)),
          );
        case "export_class_results_csv": {
          const examId = String(body.examId);
          const classSectionId = String(body.classSectionId);
          const csv = await exportClassResultsCsv(request, examId, classSectionId);
          return new NextResponse(csv, {
            headers: {
              "Content-Type": "text/csv",
              "Content-Disposition": 'attachment; filename="class-results.csv"',
            },
          });
        }
        case "export_report_card": {
          const result = await exportReportCardPdf(
            request,
            subdomain,
            String(body.studentId),
            body.examSlotId == null ? undefined : String(body.examSlotId),
          );
          if (!result.canDownload) {
            return NextResponse.json(
              { error: result.blockedReason ?? "Report card not available." },
              { status: 402 },
            );
          }
          let bytes: Uint8Array;
          try {
            const buf = Buffer.from(result.content, "base64");
            bytes = buf.length < 4 || buf.subarray(0, 4).toString() !== "%PDF"
              ? new Uint8Array(Buffer.from(result.content, "utf-8"))
              : new Uint8Array(buf);
          } catch {
            bytes = new Uint8Array(Buffer.from(result.content, "utf-8"));
          }
          return new NextResponse(bytes as any, {
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": `attachment; filename="${result.fileName}"`,
            },
          });
        }
        default:
          return NextResponse.json({ error: "Unknown action" }, { status: 400 });
      }
    } catch (err) {
      const clashes = (err as unknown as { clashes?: unknown }).clashes;
      if (clashes) {
        return NextResponse.json({ error: "Exam slot conflicts detected", clashes }, { status: 409 });
      }
      if (err instanceof DjangoApiError) {
        return NextResponse.json({ error: err.message }, { status: err.status || 400 });
      }
      const status = err instanceof Error && err.message.includes("409") ? 409 : 400;
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Request failed" },
        { status },
      );
    }
  });
}
