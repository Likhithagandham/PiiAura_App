export type FacultyTabRoute = 'dashboard' | 'attendance' | 'schedule' | 'more';

export interface FacultyRouteMeta {
  title?: string;
  subtitle?: string;
  showBack: boolean;
  parentTab: FacultyTabRoute;
}

const ROUTE_META: Record<string, FacultyRouteMeta> = {
  dashboard: { showBack: false, parentTab: 'dashboard' },
  attendance: {
    title: 'Attendance',
    subtitle: 'Grade 10 - Mathematics',
    showBack: false,
    parentTab: 'attendance',
  },
  schedule: { title: 'Schedule', showBack: false, parentTab: 'schedule' },
  more: { title: 'More', showBack: false, parentTab: 'more' },
  assignments: { title: 'Assignments', showBack: true, parentTab: 'more' },
  students: { title: 'Students', showBack: true, parentTab: 'more' },
  announcements: { title: 'Alerts', showBack: true, parentTab: 'more' },
  profile: { title: 'Profile', showBack: true, parentTab: 'more' },
  settings: { title: 'Account Settings', showBack: true, parentTab: 'more' },
  leave: { title: 'My Leave', showBack: true, parentTab: 'more' },
  'study-material': { title: 'Study Material', showBack: true, parentTab: 'more' },
  'ai-tools': { title: 'AI Tools', showBack: true, parentTab: 'more' },
  'marks-entry': { title: 'Marks Entry', showBack: true, parentTab: 'more' },
  syllabus: { title: 'Syllabus completion', showBack: true, parentTab: 'more' },
  invigilation: { title: 'Invigilation', showBack: true, parentTab: 'more' },
  salary: { title: 'My Salary', showBack: true, parentTab: 'more' },
};

export function getRouteSegment(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean);
  const facultyIndex = parts.indexOf('(faculty)');
  if (facultyIndex >= 0 && parts[facultyIndex + 1]) {
    return parts[facultyIndex + 1];
  }
  return parts[parts.length - 1] ?? 'dashboard';
}

export function getFacultyRouteMeta(pathname: string): FacultyRouteMeta {
  const segment = getRouteSegment(pathname);
  return (
    ROUTE_META[segment] ?? {
      title: segment.replace(/-/g, ' '),
      showBack: true,
      parentTab: 'more',
    }
  );
}

export function getFacultyParentTab(pathname: string): FacultyTabRoute {
  return getFacultyRouteMeta(pathname).parentTab;
}
