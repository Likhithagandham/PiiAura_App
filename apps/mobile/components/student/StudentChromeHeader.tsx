import { usePathname } from 'expo-router';
import { StudentHeader } from '@/components/student/StudentHeader';
import { getStudentRouteMeta } from '@/components/student/studentRouteMeta';

export function StudentChromeHeader() {
  const pathname = usePathname();
  const meta = getStudentRouteMeta(pathname);

  return (
    <StudentHeader
      title={meta.showBack ? meta.title : undefined}
      showBack={meta.showBack}
    />
  );
}
