/**
 * User-management service — real Django backend.
 *
 * The admin Users screen consumes UserManagementData ({ users, pending_invites,
 * multi_role_policy }). The backend endpoint GET /api/v1/auth/users/management/
 * returns that exact snake_case shape, so the real path is a typed passthrough.
 */

import type {
  CreateUserInput,
  ManagedUser,
  MultiRoleWarning,
  UserInvite,
  UserManagementData,
} from "@eduos/types";
import { djangoGet, djangoSend } from "./django-client";

const MGMT = "/api/v1/auth/users/management/";

function mgmtPath(branchQuery?: string | null): string {
  if (!branchQuery) return MGMT;
  return `${MGMT}?branch=${encodeURIComponent(branchQuery)}`;
}

export interface UserManagementListParams {
  branch?: string | null;
  page?: string | null;
  pageSize?: string | null;
  role?: string | null;
  search?: string | null;
}

function mgmtListPath(params?: UserManagementListParams): string {
  const qs = new URLSearchParams();
  if (params?.branch) qs.set("branch", params.branch);
  if (params?.page) qs.set("page", params.page);
  if (params?.pageSize) qs.set("page_size", params.pageSize);
  if (params?.role) qs.set("role", params.role);
  if (params?.search) qs.set("search", params.search);
  const q = qs.toString();
  return q ? `${MGMT}?${q}` : MGMT;
}

export async function getUserManagementData(
  request: Request,
  subdomain: string,
  branchId?: string | null,
  branchName?: string | null,
  params?: UserManagementListParams,
): Promise<UserManagementData> {
  return djangoGet<UserManagementData>(request, mgmtListPath(params));
}

export async function createUser(
  request: Request,
  subdomain: string,
  input: CreateUserInput,
  branchQuery?: string | null,
): Promise<{ user: ManagedUser; invite?: UserInvite | null }> {
  return djangoSend(request, mgmtPath(branchQuery), "POST", input);
}

export async function checkMultiRole(
  request: Request,
  subdomain: string,
  input: CreateUserInput,
): Promise<MultiRoleWarning | null> {
  const res = await djangoSend<{ warning: MultiRoleWarning | null }>(
    request,
    `${MGMT}check-multi-role/`,
    "POST",
    { phone: input.phone, email: input.email, role: input.role },
  );
  return res.warning;
}

/** Dispatch a PATCH-style action ({ action, userId }) to the backend. */
export async function userAction<T = unknown>(
  request: Request,
  action: string,
  userId: string,
  payload?: unknown,
): Promise<T> {
  return djangoSend<T>(request, `${MGMT}actions/`, "POST", { action, userId, payload });
}

// Per-action helpers used by the route handler.
export const sendInvite = (r: Request, id: string) =>
  userAction<UserInvite>(r, "send_invite", id);
export const deactivateUser = (r: Request, id: string) =>
  userAction<ManagedUser>(r, "deactivate", id);
export const activateUser = (r: Request, id: string) =>
  userAction<ManagedUser>(r, "activate", id);
export const resetPassword = (r: Request, id: string) =>
  userAction<{ user: ManagedUser; temporary_password: string }>(r, "reset_password", id);
export const hardDeleteStudent = (r: Request, id: string) =>
  userAction<{ id: string; name: string }>(r, "hard_delete_student", id);
export const promoteStudentToFaculty = (r: Request, id: string) =>
  userAction<{ student: ManagedUser; faculty: ManagedUser }>(
    r,
    "promote_student_to_faculty",
    id,
  );
export const updateUser = (r: Request, id: string, payload: import("@eduos/types").UpdateUserInput) =>
  userAction<ManagedUser>(r, "update_user", id, payload);
