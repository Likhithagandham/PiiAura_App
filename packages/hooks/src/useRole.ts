import { useAuth } from './useAuth';
import type { Role } from '@piiaura/types';
import { ACTIVE_ROLES } from '@piiaura/constants';

export function useRole() {
  const { user } = useAuth();
  const role = user?.role ?? null;

  return {
    role,
    isFaculty: role === 'faculty',
    isStudent: role === 'student',
    isActiveRole: role !== null && ACTIVE_ROLES.includes(role as Role),
  };
}
