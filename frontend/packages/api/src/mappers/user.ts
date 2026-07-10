import type { Role, User } from '@piiaura/types';

export interface EduOSMeResponse {
  id: string;
  role: string;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  custom_login_id?: string | null;
  tenant_id?: string;
  branch_id?: string | null;
}

export interface EduOSLoginResponse {
  access: string;
  refresh: string;
  must_change_password?: boolean;
  user_id: string;
  role: string;
  requires_selection?: boolean;
  accounts?: Array<{ user_id: string; role: string; label?: string }>;
}

function toAppRole(role: string): Role {
  if (role === 'faculty' || role === 'student' || role === 'parent' || role === 'admin') {
    return role;
  }
  if (role === 'super_admin' || role === 'platform_owner') {
    return 'superadmin';
  }
  return 'student';
}

export function mapEduOSMeToUser(me: EduOSMeResponse): User {
  const role = toAppRole(me.role);
  return {
    id: me.id,
    email: me.email ?? '',
    name: me.full_name,
    role,
    phone: me.phone ?? undefined,
    rollNumber: role === 'student' ? me.custom_login_id ?? undefined : undefined,
    employeeCode: role === 'faculty' ? me.custom_login_id ?? undefined : undefined,
    admissionNumber: role === 'student' ? me.custom_login_id ?? undefined : undefined,
  };
}
