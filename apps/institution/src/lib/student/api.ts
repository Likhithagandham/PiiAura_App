import { NextResponse } from "next/server";
import type { StudentAccessInfo, TokenPair } from "@eduos/types";
import { getAccessTokenFromRequest, setAuthCookies } from "@/lib/auth/cookies";
import { requireRole } from "@/lib/auth/require-role";
import { djangoGet } from "@/lib/services/django-client";
import { getTenantSubdomainFromRequest } from "@/lib/tenant";

/** BFF path prefix → licensing module id (matches STUDENT_NAV / backend policy). */
const LICENSE_GATED_PATHS: [string, string][] = [
  ["/api/student/gallery", "gallery"],
  ["/api/student/materials", "learn"],
  ["/api/student/assignments", "learn"],
  ["/api/student/electives", "learn"],
  ["/api/student/homework", "homework"],
  ["/api/student/practice-quizzes", "classroomQuiz"],
  ["/api/student/timetable", "timetable"],
  ["/api/student/exams", "exams"],
  ["/api/student/results", "exams"],
  ["/api/student/performance", "exams"],
  ["/api/student/exports/results", "exams"],
];

/** Short-lived per-user cache so every BFF call doesn't hit Django twice. */
const accessCache = new Map<string, { access: StudentAccessInfo; expires: number }>();
const ACCESS_CACHE_MS = 60_000;

async function getStudentAccess(request: Request, userId: string): Promise<StudentAccessInfo> {
  const cached = accessCache.get(userId);
  if (cached && cached.expires > Date.now()) return cached.access;
  const access = await djangoGet<StudentAccessInfo>(request, "/api/v1/auth/me/access/");
  accessCache.set(userId, { access, expires: Date.now() + ACCESS_CACHE_MS });
  return access;
}

function moduleForPath(pathname: string): string | null {
  const hit = LICENSE_GATED_PATHS.find(([prefix]) => pathname.startsWith(prefix));
  return hit ? hit[1] : null;
}

export type StudentAuthOk = {
  subdomain: string;
  studentUserId: string;
  studentName: string;
  rollNumber: string | null;
  accessToken: string;
  sessionTokens?: TokenPair;
};

export type StudentAuthResult =
  | ({ ok: true } & StudentAuthOk)
  | { ok: false; response: NextResponse };

export async function requireStudent(request: Request): Promise<StudentAuthResult> {
  const auth = await requireRole(request, "student");
  if ("error" in auth) {
    return {
      ok: false,
      response: NextResponse.json({ error: auth.error }, { status: auth.status }),
    };
  }
  const subdomain = getTenantSubdomainFromRequest(request);
  const accessToken = auth.tokens?.accessToken ?? getAccessTokenFromRequest(request);
  if (!accessToken) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  // Licensing gate: unlicensed students get 403 license_required on premium
  // modules. Fees, dashboard, notices, etc. are never gated here.
  const gatedModule = moduleForPath(new URL(request.url).pathname);
  if (gatedModule) {
    try {
      const access = await getStudentAccess(request, auth.user.id);
      if (access.blockedModules.includes(gatedModule)) {
        return {
          ok: false,
          response: NextResponse.json(
            {
              error:
                "This feature is unavailable until your student license is activated. " +
                "Please contact your school office.",
              code: "license_required",
            },
            { status: 403 },
          ),
        };
      }
    } catch {
      // If the access check itself fails, don't lock students out.
    }
  }

  return {
    ok: true,
    subdomain,
    studentUserId: auth.user.id,
    studentName: auth.user.name,
    rollNumber: auth.user.custom_login_id,
    accessToken,
    sessionTokens: auth.tokens,
  };
}

/** Attach rotated auth cookies when refresh occurred during session resolution. */
export function applyStudentSessionCookies(response: NextResponse, auth: StudentAuthOk): NextResponse {
  if (auth.sessionTokens) {
    setAuthCookies(response, auth.sessionTokens);
  }
  return response;
}

export function studentJson(auth: StudentAuthOk, data: unknown, init?: ResponseInit): NextResponse {
  return applyStudentSessionCookies(NextResponse.json(data, init), auth);
}
