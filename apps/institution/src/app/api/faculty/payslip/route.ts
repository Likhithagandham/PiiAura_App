import { getPayslip } from "@/lib/services/faculty-server";
import { djangoSend } from "@/lib/services/django-client";
import { NextResponse } from "next/server";
import { requireFaculty } from "@/lib/faculty/api";

export async function GET(request: Request) {
  const auth = await requireFaculty(request);
  if (!auth.ok) return auth.response;
  const month = new URL(request.url).searchParams.get("month") ?? undefined;
  const ctx = {
    subdomain: auth.subdomain,
    facultyUserId: auth.facultyUserId,
    facultyName: auth.facultyName,
  };
  return NextResponse.json(await getPayslip(request, ctx, month));
}

interface ExportResult {
  canDownload: boolean;
  blockedReason?: string;
  content?: string;
  fileName?: string;
}

export async function POST(request: Request) {
  const auth = await requireFaculty(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json()) as { action?: string; year?: string; month?: string };
  const action = String(body.action ?? "");

  try {
    switch (action) {
      case "export_form16": {
        const year = String(body.year ?? new Date().getFullYear());
        const result = await djangoSend<ExportResult>(
          request,
          `/api/v1/hr/me/form16/?year=${encodeURIComponent(year)}`,
          "POST",
        );
        if (!result.canDownload) {
          return NextResponse.json({ error: result.blockedReason ?? "Export blocked" }, { status: 400 });
        }
        return new NextResponse(result.content, {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="${result.fileName}"`,
          },
        });
      }
      case "export_pf": {
        const month = String(body.month ?? new Date().toISOString().slice(0, 7));
        const result = await djangoSend<ExportResult>(
          request,
          `/api/v1/hr/me/pf-statement/?month=${encodeURIComponent(month)}`,
          "POST",
        );
        if (!result.canDownload) {
          return NextResponse.json({ error: result.blockedReason ?? "Export blocked" }, { status: 400 });
        }
        return new NextResponse(result.content, {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="${result.fileName}"`,
          },
        });
      }
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Request failed" },
      { status: 400 },
    );
  }
}
