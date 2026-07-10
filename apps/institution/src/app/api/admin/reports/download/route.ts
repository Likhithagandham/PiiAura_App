import { requireAdmin } from "@/lib/admin/api";
import { getAccessTokenFromRequest } from "@/lib/auth/cookies";
import { getApiBaseUrl } from "@/lib/config";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const id = new URL(request.url).searchParams.get("id") ?? "";
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const accessToken = getAccessTokenFromRequest(request);
  const djangoRes = await fetch(`${getApiBaseUrl()}/api/v1/analytics/reports/${id}/download/`, {
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  });

  if (!djangoRes.ok) {
    const json = await djangoRes.json().catch(() => ({}));
    return NextResponse.json(
      { error: (json as { error?: string; message?: string }).error ?? (json as { message?: string }).message ?? "Download failed" },
      { status: djangoRes.status },
    );
  }

  const contentType = djangoRes.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const json = (await djangoRes.json()) as { data?: { downloadUrl?: string }; downloadUrl?: string };
    const url = json.data?.downloadUrl ?? json.downloadUrl;
    if (url) {
      return NextResponse.redirect(url);
    }
    return NextResponse.json({ error: "No download available" }, { status: 404 });
  }

  const blob = await djangoRes.arrayBuffer();
  const disposition = djangoRes.headers.get("content-disposition") ?? `attachment; filename="report-${id}.csv"`;
  return new NextResponse(blob, {
    headers: {
      "Content-Type": contentType || "text/csv",
      "Content-Disposition": disposition,
    },
  });
}
