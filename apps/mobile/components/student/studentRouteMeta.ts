export type StudentTabRoute = 'dashboard' | 'learn' | 'timetable' | 'more';

export const STUDENT_PARENT_TAB_ROUTES: Record<StudentTabRoute, string> = {
  dashboard: '/(student)/dashboard',
  learn: '/(student)/learn',
  timetable: '/(student)/timetable',
  more: '/(student)/more',
};

export interface StudentRouteMeta {
  title?: string;
  showBack: boolean;
  parentTab: StudentTabRoute;
}

const ROUTE_META: Record<string, StudentRouteMeta> = {
  dashboard: { showBack: false, parentTab: 'dashboard' },
  learn: { title: 'Learn', showBack: false, parentTab: 'learn' },
  attendance: { title: 'Attendance', showBack: true, parentTab: 'more' },
  timetable: { title: 'Timetable', showBack: false, parentTab: 'timetable' },
  more: { title: 'More', showBack: false, parentTab: 'more' },
  assignments: { title: 'Assignments', showBack: true, parentTab: 'learn' },
  grades: { title: 'Grades', showBack: true, parentTab: 'more' },
  announcements: { title: 'Notices', showBack: true, parentTab: 'more' },
  profile: { title: 'Profile', showBack: true, parentTab: 'more' },
  homework: { title: 'Homework', showBack: true, parentTab: 'more' },
  exams: { title: 'Exams', showBack: true, parentTab: 'more' },
  fees: { title: 'Fees', showBack: true, parentTab: 'more' },
  leave: { title: 'My Leave', showBack: true, parentTab: 'more' },
  alerts: { title: 'Alerts', showBack: true, parentTab: 'more' },
  notices: { title: 'Notices', showBack: true, parentTab: 'more' },
  help: { title: 'Help Center', showBack: true, parentTab: 'more' },
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

export function getStudentParentTabRoute(pathname: string): string {
  return STUDENT_PARENT_TAB_ROUTES[getStudentParentTab(pathname)];
}
