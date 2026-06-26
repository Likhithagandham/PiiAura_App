import type {
  FacultyDashboardData,
  FacultyDashboardStats,
  Announcement,
  Assignment,
} from '@piiaura/types';

export const mockFacultyDashboardStats: FacultyDashboardStats = {
  totalStudents: 42,
  classesToday: 0,
  pendingAssignments: 5,
  attendanceRate: 100,
};

export const mockFacultyDashboardData: FacultyDashboardData = {
  alert: {
    id: 'alert-001',
    message: 'Students awaiting your approval on applications.',
    count: 2,
    actionLabel: 'View details',
  },
  attendanceSummary: {
    markedPercentage: 100,
    sessionsCompleted: 0,
    sessionsTotal: 0,
  },
  pendingLeave: 2,
  liveAttendancePercent: 78,
  pendingTasks: [
    {
      id: 'task-001',
      title: 'Leave requests pending',
      description: 'Students awaiting your approval on leave applications.',
      count: 2,
      accentColor: '#92400E',
    },
    {
      id: 'task-002',
      title: 'Invigilation duty',
      description: 'You have upcoming exam invigilation assignments.',
      count: 1,
      accentColor: '#9CA3AF',
    },
  ],
  holidays: [
    {
      id: 'hol-001',
      name: 'Independence Day',
      month: 'AUG',
      day: '15',
      scope: 'Institution-wide',
      variant: 'highlight',
    },
    {
      id: 'hol-002',
      name: 'Diwali Break',
      month: 'OCT',
      day: '20',
      scope: 'Institution-wide',
      variant: 'default',
    },
  ],
  teachingProgress: 50,
  todaySessions: [],
};

export const mockFacultyAnnouncements: Announcement[] = [
  {
    id: 'ann-001',
    title: 'Mid-term exam schedule released',
    body: 'The mid-term examination timetable for CSE Year 3 has been published.',
    author: 'Academic Office',
    createdAt: '2026-06-20T09:00:00Z',
    priority: 'high',
    audience: ['faculty', 'student'],
  },
  {
    id: 'ann-002',
    title: 'Faculty meeting — Friday 2 PM',
    body: 'All department faculty are requested to attend the monthly review meeting.',
    author: 'HOD — Computer Science',
    createdAt: '2026-06-18T14:30:00Z',
    priority: 'medium',
    audience: ['faculty'],
  },
];

export const mockFacultyAssignments: Assignment[] = [
  {
    id: 'asg-001',
    title: 'Data Structures — Binary Trees',
    subject: 'Data Structures',
    description: 'Implement and analyze binary search tree operations.',
    dueDate: '2026-06-28',
    status: 'pending',
    maxMarks: 20,
  },
  {
    id: 'asg-002',
    title: 'DBMS — Normalization Exercise',
    subject: 'Database Management',
    description: 'Normalize the given schema to 3NF.',
    dueDate: '2026-07-02',
    status: 'pending',
    maxMarks: 15,
  },
];
