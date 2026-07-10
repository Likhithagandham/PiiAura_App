import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const metric = await request.json();
    // In production wire this to your observability stack (Datadog, Grafana, etc.)
    console.log("[web-vitals]", JSON.stringify(metric));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
