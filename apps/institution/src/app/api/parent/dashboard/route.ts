import { bridge } from "@/lib/services/route-bridge";
import { NextResponse } from "next/server";
import { parentJson, requireChildId, requireParent } from "@/lib/parent/api";

export async function GET(request: Request) {
  const auth = await requireParent(request);
  if (!auth.ok) return auth.response;

  const childId = requireChildId(request);
  if (!childId) {
    return NextResponse.json({ error: "childId is required" }, { status: 400 });
  }

  try {
    const dashboard = await bridge<Record<string, unknown>>(request, {
      path: `/api/v1/parent/children/${childId}/dashboard/`,
    });
    return parentJson(auth, {
      ...dashboard,
      todayAssignments: (dashboard.todayAssignments as unknown[]) ?? [],
      announcements: (dashboard.announcements as unknown[]) ?? [],
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load" },
      { status: 400 },
    );
  }
}
