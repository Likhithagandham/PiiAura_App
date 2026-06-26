import { useQuery } from '@tanstack/react-query';
import {
  mockFacultyDashboardStats,
  mockFacultyDashboardData,
  mockFacultyAnnouncements,
  mockFacultyAttendanceSession,
  mockFacultyScheduleData,
  mockFacultyLeaveData,
  mockStudentDashboardStats,
  mockStudentAnnouncements,
  mockStudentAttendance,
  mockStudentAssignments,
  mockStudentGrades,
  mockStudentTimetable,
  mockFacultyAssignments,
} from '@piiaura/mock-data';
import { APP_CONFIG } from '@piiaura/constants';

const staleTime = APP_CONFIG.QUERY_STALE_TIME_MS;

export function useFacultyDashboard() {
  return useQuery({
    queryKey: ['faculty', 'dashboard'],
    queryFn: async () => ({
      stats: mockFacultyDashboardStats,
      data: mockFacultyDashboardData,
      announcements: mockFacultyAnnouncements.slice(0, 2),
    }),
    staleTime,
  });
}

export function useStudentDashboard() {
  return useQuery({
    queryKey: ['student', 'dashboard'],
    queryFn: async () => ({
      stats: mockStudentDashboardStats,
      announcements: mockStudentAnnouncements.slice(0, 2),
    }),
    staleTime,
  });
}

export function useAttendance(role: 'faculty' | 'student') {
  return useQuery({
    queryKey: [role, 'attendance'],
    queryFn: async () => mockStudentAttendance,
    staleTime,
  });
}

export function useAssignments(role: 'faculty' | 'student') {
  return useQuery({
    queryKey: [role, 'assignments'],
    queryFn: async () =>
      role === 'faculty' ? mockFacultyAssignments : mockStudentAssignments,
    staleTime,
  });
}

export function useGrades() {
  return useQuery({
    queryKey: ['student', 'grades'],
    queryFn: async () => mockStudentGrades,
    staleTime,
  });
}

export function useTimetable() {
  return useQuery({
    queryKey: ['student', 'timetable'],
    queryFn: async () => mockStudentTimetable,
    staleTime,
  });
}

export function useAnnouncements(role: 'faculty' | 'student') {
  return useQuery({
    queryKey: [role, 'announcements'],
    queryFn: async () =>
      role === 'faculty' ? mockFacultyAnnouncements : mockStudentAnnouncements,
    staleTime,
  });
}

export function useFacultyAttendanceSession() {
  return useQuery({
    queryKey: ['faculty', 'attendance', 'session'],
    queryFn: async () => mockFacultyAttendanceSession,
    staleTime,
  });
}

export function useFacultySchedule() {
  return useQuery({
    queryKey: ['faculty', 'schedule'],
    queryFn: async () => mockFacultyScheduleData,
    staleTime,
  });
}

export function useFacultyLeave() {
  return useQuery({
    queryKey: ['faculty', 'leave'],
    queryFn: async () => mockFacultyLeaveData,
    staleTime,
  });
}
