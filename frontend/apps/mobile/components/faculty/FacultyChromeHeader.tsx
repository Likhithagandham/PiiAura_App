import { usePathname } from 'expo-router';
import { FacultyHeader } from '@/components/faculty/FacultyHeader';
import { getFacultyRouteMeta } from '@/components/faculty/facultyRouteMeta';

export function FacultyChromeHeader() {
  const pathname = usePathname();
  const meta = getFacultyRouteMeta(pathname);

  return (
    <FacultyHeader
      title={meta.title}
      subtitle={meta.subtitle}
      showBack={meta.showBack}
    />
  );
}
