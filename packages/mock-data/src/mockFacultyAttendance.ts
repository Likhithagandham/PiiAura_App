import type { FacultyAttendanceSession } from '@piiaura/types';

export const mockFacultyAttendanceSession: FacultyAttendanceSession = {
  id: 'session-001',
  title: 'Mark attendance',
  subtitle: 'Grade 10 - Mathematics',
  periodLabel: '09:30 AM - 10:30 AM',
  totalStudents: 32,
  students: [
    { id: 'stu-101', name: 'Aarav Agarwal', rollNumber: '101' },
    { id: 'stu-102', name: 'Bhavna Das', rollNumber: '102' },
    { id: 'stu-103', name: 'Chetan Kumar', rollNumber: '103' },
    { id: 'stu-104', name: 'Divya Menon', rollNumber: '104' },
    { id: 'stu-105', name: 'Esha Kapoor', rollNumber: '105' },
    { id: 'stu-106', name: 'Farhan Raza', rollNumber: '106' },
    { id: 'stu-107', name: 'Gita Nair', rollNumber: '107' },
    { id: 'stu-108', name: 'Harsh Patel', rollNumber: '108' },
  ],
};

