export type StudentTabRoute = 'dashboard' | 'attendance' | 'timetable' | 'more';

export interface StudentRouteMeta {
  title?: string;
  showBack: boolean;
  parentTab: StudentTabRoute;
}

const ROUTE_META: Record<string, StudentRouteMeta> = {
  dashboard: { showBack: false, parentTab: 'dashboard' },
  attendance: { title: 'Attendance', showBack: false, parentTab: 'attendance' },
  timetable: { title: 'Schedule', showBack: false, parentTab: 'timetable' },
  more: { title: 'More', showBack: false, parentTab: 'more' },
  assignments: { title: 'Assignments', showBack: true, parentTab: 'more' },
  grades: { title: 'Grades', showBack: true, parentTab: 'more' },
  announcements: { title: 'Announcements', showBack: true, parentTab: 'more' },
  profile: { title: 'Profile', showBack: true, parentTab: 'more' },
};

export function getRouteSegment(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean);
  const studentIndex = parts.indexOf('(student)');
  if (studentIndex >= 0 && parts[studentIndex + 1]) {
    return parts[studentIndex + 1];
  }
  return parts[parts.length - 1] ?? 'dashboard';
}

export function getStudentRouteMeta(pathname: string): StudentRouteMeta {
  const segment = getRouteSegment(pathname);
  return (
    ROUTE_META[segment] ?? {
      title: segment.replace(/-/g, ' '),
      showBack: true,
      parentTab: 'more',
    }
  );
}

export function getStudentParentTab(pathname: string): StudentTabRoute {
  return getStudentRouteMeta(pathname).parentTab;
}
