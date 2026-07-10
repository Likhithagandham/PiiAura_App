import { usePathname } from 'expo-router';
import { StudentHeader } from '@/components/student/StudentHeader';
import { getStudentRouteMeta, getRouteSegment } from '@/components/student/studentRouteMeta';

export function StudentChromeHeader() {
  const pathname = usePathname();
  const meta = getStudentRouteMeta(pathname);
  const segment = getRouteSegment(pathname);
  const isDashboard = segment === 'dashboard';
  const isMoreHub = segment === 'more' && !meta.showBack;

  return (
    <StudentHeader
      moduleTitle={isDashboard ? undefined : meta.title}
      showBack={meta.showBack}
      showSearch={isDashboard}
      showSettings={isMoreHub}
    />
  );
}
