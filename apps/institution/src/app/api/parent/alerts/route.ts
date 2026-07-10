import { bridge } from "@/lib/services/route-bridge";
import { NextResponse } from "next/server";
import { parentJson, requireChildId, requireParent } from "@/lib/parent/api";

/** Operational alert inbox for the selected child */
export async function GET(request: Request) {
  const auth = await requireParent(request);
  if (!auth.ok) return auth.response;
  const childId = requireChildId(request);
  if (!childId) return NextResponse.json({ error: "childId is required" }, { status: 400 });

  try {
    const data = await bridge<{ alerts: unknown[] }>(request, {
      path: `/api/v1/parent/children/${childId}/alerts/`,
    });
    return parentJson(auth, data);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 400 });
  }
}
