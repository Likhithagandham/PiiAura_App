import { NextResponse } from "next/server";
import type { StudentAccessInfo } from "@eduos/types";
import { requireStudent, studentJson } from "@/lib/student/api";
import { djangoGet } from "@/lib/services/django-client";

export async function GET(request: Request) {
  const auth = await requireStudent(request);
  if (!auth.ok) return auth.response;
  try {
    const data = await djangoGet<StudentAccessInfo>(request, "/api/v1/auth/me/access/");
    return studentJson(auth, data);
  } catch {
    // Fail open — never lock a student out because the access check errored.
    return NextResponse.json({
      licenseStatus: null,
      subscriptionStatus: null,
      blockedModules: [],
    } satisfies StudentAccessInfo);
  }
}
