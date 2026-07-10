import type { CreateUserInput } from "@eduos/types";
import { NextResponse } from "next/server";
import { requireSuperAdmin, superAdminJson } from "@/lib/super-admin/api";
import { DjangoApiError } from "@/lib/services/django-client";
import { createUser, getUserManagementData } from "@/lib/services/users.service";
import { mapSuperAdminError } from "../errors";

function branchQuery(request: Request): string | null {
  const url = new URL(request.url);
  return url.searchParams.get("branch");
}

export async function GET(request: Request) {
  const auth = await requireSuperAdmin(request);
  if (!auth.ok) return auth.response;

  try {
    const url = new URL(request.url);
    const bq = branchQuery(request) ?? "all";
    const data = await getUserManagementData(request, auth.subdomain, null, null, {
      branch: bq,
      page: url.searchParams.get("page"),
      pageSize: url.searchParams.get("page_size"),
      role: url.searchParams.get("role"),
      search: url.searchParams.get("search"),
    });
    return superAdminJson(auth, data);
  } catch (err) {
    const { message, status } = mapSuperAdminError(err);
    return superAdminJson(auth, { error: message }, { status });
  }
}

export async function POST(request: Request) {
  const auth = await requireSuperAdmin(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json()) as CreateUserInput;
  if (!body.branchId) {
    return NextResponse.json({ error: "branchId is required." }, { status: 400 });
  }

  try {
    const result = await createUser(request, auth.subdomain, body, branchQuery(request));
    return superAdminJson(auth, result, { status: 201 });
  } catch (err) {
    const status = err instanceof DjangoApiError ? err.status || 400 : 400;
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not create user" },
      { status },
    );
  }
}
