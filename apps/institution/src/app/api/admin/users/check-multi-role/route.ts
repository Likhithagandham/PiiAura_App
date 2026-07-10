import type { CreateUserInput } from "@eduos/types";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/api";
import { checkMultiRole } from "@/lib/services/users.service";

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json()) as CreateUserInput;
  const warning = await checkMultiRole(request, auth.subdomain, body);
  return NextResponse.json({ warning });
}
