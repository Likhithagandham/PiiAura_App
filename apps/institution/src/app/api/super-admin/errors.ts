import { NextResponse } from "next/server";
import { BackendNotImplementedError } from "@/lib/services/data-source";
import { DjangoApiError } from "@/lib/services/super-admin-server";

export function mapSuperAdminError(err: unknown): { message: string; status: number } {
  if (err instanceof BackendNotImplementedError) {
    return { message: err.message, status: 501 };
  }
  if (err instanceof DjangoApiError) {
    const status = err.status >= 400 && err.status < 500 ? err.status : 502;
    return { message: err.message, status };
  }
  return {
    message: err instanceof Error ? err.message : "Request failed",
    status: 400,
  };
}

export function superAdminErrorJson(err: unknown): NextResponse {
  const { message, status } = mapSuperAdminError(err);
  return NextResponse.json({ error: message }, { status });
}

export function tenantSeedFromConfig(cfg: {
  institution_name: string;
  institution_type: "school" | "college";
  logo_url: string | null;
}) {
  return { name: cfg.institution_name, type: cfg.institution_type, logoUrl: cfg.logo_url };
}
