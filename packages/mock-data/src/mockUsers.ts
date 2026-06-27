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
  name: 'Aarav Patel',
  role: 'student',
  className: 'BCS III',
  rollNumber: 'CS21B045',
  admissionNumber: 'CS21B045',
  avatarUrl:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBy_f3XlGtJ5Ig-lWW3BEeKuexWZWfMedQSQbX6gAwE13vQqEKgMBD2Jx1uH8a9kjAfeB_A1nMxAcCyYsthp3vbfvNbGv11XcqmgbpqKl7VmvcwUeO58ZRyyyohHbfJLwat7KSRCFL7AKwStc_bRZ6G0MegqlIFWsvTODopr6kyQgybihRkLufoimTB1-SlVNCuw92r3oScTr0uas4EuAsoSgbzWg0AzNmmlqvRoenY01nPaxYPabindXzY81zh0epTkWSzMf8kBlcs',
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
