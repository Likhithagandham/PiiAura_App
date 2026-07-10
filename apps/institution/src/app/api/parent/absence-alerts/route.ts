import { bridge } from "@/lib/services/route-bridge";
import { NextResponse } from "next/server";
import { parentJson, requireChildId, requireParent } from "@/lib/parent/api";

/** Per-child absence SMS / push alert preferences */
export async function GET(request: Request) {
  const auth = await requireParent(request);
  if (!auth.ok) return auth.response;
  const childId = requireChildId(request);
  if (!childId) return NextResponse.json({ error: "childId is required" }, { status: 400 });

  try {
    const data = await bridge(request, {
      path: `/api/v1/parent/children/${childId}/absence-alerts/`,
    });
    return parentJson(auth, data);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const auth = await requireParent(request);
  if (!auth.ok) return auth.response;
  const childId = requireChildId(request);
  if (!childId) return NextResponse.json({ error: "childId is required" }, { status: 400 });

  try {
    const body = (await request.json()) as {
      sms?: boolean;
      in_app?: boolean;
      email?: boolean;
    };
    const data = await bridge(request, {
      path: `/api/v1/parent/children/${childId}/absence-alerts/`,
      method: "PATCH",
      body,
    });
    return parentJson(auth, data);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 400 });
  }
}
