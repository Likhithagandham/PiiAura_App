import type { Role } from "../auth";
import type { PaginatedResult } from "../common";

export type AssignableRole = "admin" | "faculty" | "student" | "parent";

export type InviteStatus = "none" | "pending" | "accepted" | "expired";

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: AssignableRole;
  custom_login_id: string | null;
  linked_user_group_id: string | null;
  branch: string | null;
  is_active: boolean;
  invite_status: InviteStatus;
  password_reset_required: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserInvite {
  id: string;
  user_id: string;
  name: string;
  email: string;
  token: string;
  invite_url: string;
  created_at: string;
  expires_at: string;
  used_at: string | null;
}

export interface LinkedAccountSummary {
  user_id: string;
  name: string;
  role: AssignableRole;
  is_active: boolean;
}

export interface CreateUserInput {
  name: string;
  email: string;
  phone: string;
  role: AssignableRole;
  send_invite: boolean;
  branchId?: string;
  batchId?: string;
}

export interface UpdateUserInput {
  name: string;
  email: string;
  phone: string;
}

export interface UserManagementData {
  users: PaginatedResult<ManagedUser>;
  pending_invites: UserInvite[];
  multi_role_policy: string;
  branchId?: string | null;
  branchName?: string | null;
  branchScope?: string | null;
}

export interface MultiRoleWarning {
  existing_accounts: LinkedAccountSummary[];
  will_link_by: "phone" | "email";
  linked_user_group_id: string;
}
