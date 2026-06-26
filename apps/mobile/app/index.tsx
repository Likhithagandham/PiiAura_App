import { Redirect } from 'expo-router';
import { useAuth } from '@piiaura/hooks';
import { ROUTES } from '@piiaura/constants';
import type { Role } from '@piiaura/types';

const ROLE_ROUTE: Record<Role, string> = {
  faculty: ROUTES.FACULTY.DASHBOARD,
  student: ROUTES.STUDENT.DASHBOARD,
  parent: ROUTES.AUTH.LOGIN,
  admin: ROUTES.AUTH.LOGIN,
  superadmin: ROUTES.AUTH.LOGIN,
};

export default function Index() {
  const { isAuthenticated, user, hasHydrated } = useAuth();

  if (!hasHydrated) {
    return null;
  }

  if (!isAuthenticated || !user) {
    return <Redirect href={ROUTES.AUTH.LOGIN} />;
  }

  return <Redirect href={ROLE_ROUTE[user.role] as '/(faculty)/dashboard' | '/(student)/dashboard'} />;
}
