/**
 * Branch admin account profile — Django backend.
 */

import type { AdminAccountProfileData, AuthUser } from "@eduos/types";
import { djangoGet } from "./django-client";
import * as authServer from "./auth-server";

interface DjangoMePayload {
  id: string;
  full_name: string;
  role: string;
  email: string | null;
  phone: string | null;
  branch_id: string | null;
  date_joined: string;
}

export async function getAdminAccountProfile(
  request: Request,
  subdomain: string,
  user: AuthUser,
): Promise<AdminAccountProfileData> {
  const [me, cfg] = await Promise.all([
    djangoGet<DjangoMePayload>(request, "/api/v1/auth/me/"),
    authServer.getTenantLoginConfig(subdomain),
  ]);

  let branchName: string | null = null;
  try {
    const mgmt = await djangoGet<{ branchName?: string }>(
      request,
      "/api/v1/auth/users/management/",
    );
    branchName = mgmt.branchName ?? null;
  } catch {
    branchName = null;
  }

  return {
    userId: me.id,
    name: me.full_name,
    role: me.role,
    roleLabel: "Branch Admin",
    phone: me.phone,
    email: me.email,
    institutionName: cfg.institution_name,
    branchName,
    branchId: me.branch_id,
    institutionType: cfg.institution_type === "college" ? "college" : "school",
    dateJoined: me.date_joined,
  };
}
