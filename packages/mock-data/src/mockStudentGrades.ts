import type {
  StudentDashboardStats,
  Announcement,
  Assignment,
  Grade,
  AttendanceRecord,
} from '@piiaura/types';

export const mockStudentDashboardStats: StudentDashboardStats = {
  attendancePercentage: 88,
  pendingAssignments: 2,
  upcomingExams: 1,
  averageGrade: 'A',
};

export const mockStudentAnnouncements: Announcement[] = [
  {
    id: 'ann-101',
    title: 'Library hours extended',
    body: 'The central library will remain open until 10 PM during exam week.',
    author: 'Library Admin',
    createdAt: '2026-06-19T11:00:00Z',
    priority: 'low',
    audience: ['student'],
  },
];

export const mockStudentAssignments: Assignment[] = [
  {
    id: 'asg-101',
    title: 'Operating Systems — Process Scheduling',
    subject: 'Operating Systems',
    description: 'Simulate FCFS, SJF, and Round Robin scheduling algorithms.',
    dueDate: '2026-06-26',
    status: 'pending',
    maxMarks: 25,
  },
  {
    id: 'asg-102',
    title: 'Computer Networks — Subnetting',
    subject: 'Computer Networks',
    description: 'Solve subnetting problems for the given IP ranges.',
    dueDate: '2026-06-22',
    status: 'submitted',
    maxMarks: 20,
  },
];

export const mockStudentGrades: Grade[] = [
  {
    id: 'grd-001',
    subject: 'Data Structures',
    examType: 'Mid-term',
    marks: 42,
    maxMarks: 50,
    grade: 'A',
    date: '2026-05-15',
  },
  {
    id: 'grd-002',
    subject: 'Database Management',
    examType: 'Assignment',
    marks: 18,
    maxMarks: 20,
    grade: 'A+',
    date: '2026-05-28',
  },
];

export const mockStudentAttendance: AttendanceRecord[] = [
  { id: 'att-001', date: '2026-06-23', status: 'present', subject: 'Data Structures' },
  { id: 'att-002', date: '2026-06-22', status: 'present', subject: 'Operating Systems' },
  { id: 'att-003', date: '2026-06-21', status: 'absent', subject: 'Computer Networks' },
];
