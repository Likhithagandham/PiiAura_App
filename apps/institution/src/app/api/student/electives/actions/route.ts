import { NextResponse } from "next/server";
import { bridge } from "@/lib/services/route-bridge";
import type { SaveElectiveSelectionInput } from "@eduos/types";
import { requireStudent, studentJson } from "@/lib/student/api";

export class AuthError extends Error {
  constructor(msg?: string) {
    super(msg ?? "Authentication error");
    this.name = "AuthError";
  }
}

export async function PATCH(request: Request) {
  const auth = await requireStudent(request);
  if (!auth.ok) return auth.response;

  try {
    const body = (await request.json()) as { action?: string; payload?: unknown; [k: string]: unknown };
    const action = String(body.action ?? "");
    switch (action) {
      case "save_selection":
        return studentJson(
          auth,
          await bridge(request, {
            path: "/api/v1/academics/me/electives/select/",
            method: "PATCH",
            body: {
              ...(body.payload as SaveElectiveSelectionInput),
              studentName: auth.studentName,
            },
          }),
        );
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (err) {
    const msg = err instanceof AuthError ? err.message : "Request failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
