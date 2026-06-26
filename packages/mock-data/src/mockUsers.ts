import type { User } from '@piiaura/types';

export const mockFacultyUser: User = {
  id: 'fac-001',
  email: 'faculty@piiaura.edu',
  name: 'Prof. Kavitha Rao',
  role: 'faculty',
  department: 'Computer Science',
  employeeCode: 'FAC001',
  avatarUrl: undefined,
};

export const mockStudentUser: User = {
  id: 'stu-001',
  email: 'student@piiaura.edu',
  name: 'Rahul Verma',
  role: 'student',
  className: 'B.Tech CSE — Year 3',
  rollNumber: 'CS21B045',
  admissionNumber: 'CS21B045',
  avatarUrl: undefined,
};

export const mockUsers: User[] = [mockFacultyUser, mockStudentUser];

export const MOCK_CREDENTIALS = {
  faculty: {
    identifiers: ['FAC001', 'faculty@piiaura.edu'],
    password: 'faculty123',
  },
  student: {
    identifiers: ['CS21B045', 'student@piiaura.edu'],
    password: 'student123',
  },
} as const;
