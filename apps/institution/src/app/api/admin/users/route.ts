import type { CreateUserInput } from "@eduos/types";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/api";
import { DjangoApiError } from "@/lib/services/django-client";
import { createUser, getUserManagementData } from "@/lib/services/users.service";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  const url = new URL(request.url);
  return NextResponse.json(
    await getUserManagementData(request, auth.subdomain, auth.user.branch_id, auth.user.branch, {
      page: url.searchParams.get("page"),
      pageSize: url.searchParams.get("page_size"),
      role: url.searchParams.get("role"),
      search: url.searchParams.get("search"),
    }),
  );
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json()) as CreateUserInput;
  try {
    const result = await createUser(request, auth.subdomain, body);
    return NextResponse.json(result);
  } catch (err) {
    const status = err instanceof DjangoApiError ? err.status || 400 : 400;
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not create user" },
      { status },
    );
  }
}
