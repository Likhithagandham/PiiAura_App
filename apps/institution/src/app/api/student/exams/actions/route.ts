import { NextResponse } from "next/server";
import { bridge } from "@/lib/services/route-bridge";
import { applyStudentSessionCookies, requireStudent, studentJson } from "@/lib/student/api";

export async function PATCH(request: Request) {
  const auth = await requireStudent(request);
  if (!auth.ok) return auth.response;

  try {
    const body = (await request.json()) as { action: string; [key: string]: unknown };

    switch (body.action) {
      case "hall_ticket": {
        const result = await bridge<{
          canDownload: boolean;
          content?: string;
          blockedReason?: string;
          invoice?: unknown;
        }>(request, {
          path: `/api/v1/examinations/me/hall-ticket/`,
          method: "POST",
          body: { examSlotId: body.examSlotId ?? "exam-1" },
        });
        if (!result.canDownload) return studentJson(auth, result, { status: 402 });
        return applyStudentSessionCookies(
          new NextResponse(result.content, {
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": `attachment; filename="hall-ticket.pdf"`,
            },
          }),
          auth,
        );
      }
      case "pay_exam_fee": {
        const result = await bridge(request, {
          path: `/api/v1/fees/me/exam-fee/pay/`,
          method: "POST",
          body: { examSlotId: body.examSlotId ?? "exam-1" },
        });
        return studentJson(auth, { invoice: result });
      }
      case "download_report_card": {
        const result = await bridge<{ canDownload: boolean; content?: string; fileName?: string }>(
          request,
          {
            path: `/api/v1/examinations/me/report-card/pdf/`,
            method: "POST",
          },
        );
        if (!result.canDownload) return studentJson(auth, result, { status: 402 });
        return applyStudentSessionCookies(
          new NextResponse(result.content, {
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": `attachment; filename="${result.fileName}"`,
            },
          }),
          auth,
        );
      }
      case "download_marksheet": {
        const result = await bridge<{ canDownload: boolean; content?: string; fileName?: string }>(
          request,
          {
            path: `/api/v1/examinations/me/marksheet/pdf/`,
            method: "POST",
          },
        );
        if (!result.canDownload) return studentJson(auth, result, { status: 402 });
        return applyStudentSessionCookies(
          new NextResponse(result.content, {
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": `attachment; filename="${result.fileName}"`,
            },
          }),
          auth,
        );
      }
      case "download_transcript": {
        const result = await bridge<{ canDownload: boolean; content?: string; fileName?: string }>(
          request,
          {
            path: `/api/v1/examinations/me/transcript/pdf/`,
            method: "POST",
          },
        );
        if (!result.canDownload) return studentJson(auth, result, { status: 402 });
        return applyStudentSessionCookies(
          new NextResponse(result.content, {
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": `attachment; filename="${result.fileName}"`,
            },
          }),
          auth,
        );
      }
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Request failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
