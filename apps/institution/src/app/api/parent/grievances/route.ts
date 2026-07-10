import type { ParentCreateGrievanceInput } from "@eduos/types";
import { bridge } from "@/lib/services/route-bridge";
import { NextResponse } from "next/server";
import { parentJson, requireChildId, requireParent } from "@/lib/parent/api";

export async function GET(request: Request) {
  const auth = await requireParent(request);
  if (!auth.ok) return auth.response;
  const childId = requireChildId(request);
  if (!childId) return NextResponse.json({ error: "childId is required" }, { status: 400 });

  try {
    const data = await bridge(request, {
      path: `/api/v1/parent/children/${childId}/grievances/`,
    });
    return parentJson(auth, data);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 400 });
  }
}

export async function POST(request: Request) {
  const auth = await requireParent(request);
  if (!auth.ok) return auth.response;
  const childId = requireChildId(request);
  if (!childId) return NextResponse.json({ error: "childId is required" }, { status: 400 });

  try {
    const body = (await request.json()) as ParentCreateGrievanceInput;
    const grievance = await bridge(request, {
      path: `/api/v1/parent/children/${childId}/grievances/`,
      method: "POST",
      body,
    });
    return parentJson(auth, { grievance });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 400 });
  }
}
