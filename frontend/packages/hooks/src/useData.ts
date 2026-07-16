import { useQuery } from '@tanstack/react-query';
import {
  getFacultyAiTools,
  getFacultyAlerts,
  getFacultyAnnouncements,
  getFacultyAssignments,
  getFacultyAssignmentsScreen,
  getFacultyAttendanceSession,
  getFacultyDashboard,
  getFacultyHelpSupport,
  getFacultyInvigilation,
  getFacultyLeave,
  getFacultyMarksEntry,
  getFacultyProfile,
  getFacultySalary,
  getFacultySchedule,
  getFacultySettings,
  getFacultyStudyMaterial,
  getFacultySyllabus,
  getStudentAlerts,
  getStudentAnnouncements,
  getStudentAssignments,
  getStudentAttendance,
  getStudentDashboard,
  getStudentExams,
  getStudentFees,
  getStudentGrades,
  getStudentHelpCenter,
  getStudentHomework,
  getStudentLearn,
  getStudentLeave,
  getStudentMore,
  getStudentNotices,
  getStudentProfile,
  getStudentTimetable,
} from '@piiaura/api';
import { APP_CONFIG } from '@piiaura/constants';
import { useAuthStore } from './useAuth';

const staleTime = APP_CONFIG.QUERY_STALE_TIME_MS;

function useAuthReady() {
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const accessToken = useAuthStore((s) => s.tokens?.access);
  return hasHydrated && isAuthenticated && Boolean(accessToken);
}

export function useFacultyDashboard() {
  const authReady = useAuthReady();
  return useQuery({
    queryKey: ['faculty', 'dashboard'],
    queryFn: getFacultyDashboard,
    enabled: authReady,
    staleTime,
    retry: 1,
  });
}

export function useStudentDashboard() {
  const authReady = useAuthReady();
  return useQuery({
    queryKey: ['student', 'dashboard'],
    queryFn: getStudentDashboard,
    enabled: authReady,
    staleTime,
    retry: 1,
  });
}

export function useAttendance(role: 'faculty' | 'student') {
  const authReady = useAuthReady();
  return useQuery({
    queryKey: [role, 'attendance'],
    queryFn: getStudentAttendance,
    enabled: role === 'student' && authReady,
    staleTime,
    retry: 1,
  });
}

export function useAssignments(role: 'faculty' | 'student') {
  const authReady = useAuthReady();
  return useQuery({
    queryKey: [role, 'assignments'],
    queryFn: role === 'faculty' ? getFacultyAssignments : getStudentAssignments,
    enabled: authReady,
    staleTime,
    retry: 1,
  });
}

export function useGrades() {
  const authReady = useAuthReady();
  return useQuery({
    queryKey: ['student', 'grades'],
    queryFn: getStudentGrades,
    enabled: authReady,
    staleTime,
    retry: 1,
  });
}

export function useTimetable() {
  const authReady = useAuthReady();
  return useQuery({
    queryKey: ['student', 'timetable'],
    queryFn: getStudentTimetable,
    enabled: authReady,
    staleTime,
    retry: 1,
  });
}

export function useStudentTimetable() {
  return useTimetable();
}

export function useStudentLearn() {
  const authReady = useAuthReady();
  return useQuery({
    queryKey: ['student', 'learn'],
    queryFn: getStudentLearn,
    enabled: authReady,
    staleTime,
    retry: 1,
  });
}

export function useStudentMore() {
  const authReady = useAuthReady();
  return useQuery({
    queryKey: ['student', 'more'],
    queryFn: getStudentMore,
    enabled: authReady,
    staleTime,
    retry: 1,
  });
}

export function useStudentHomework() {
  const authReady = useAuthReady();
  return useQuery({
    queryKey: ['student', 'homework'],
    queryFn: getStudentHomework,
    enabled: authReady,
    staleTime,
    retry: 1,
  });
}

export function useStudentExams() {
  const authReady = useAuthReady();
  return useQuery({
    queryKey: ['student', 'exams'],
    queryFn: getStudentExams,
    enabled: authReady,
    staleTime,
    retry: 1,
  });
}

export function useStudentFees() {
  const authReady = useAuthReady();
  return useQuery({
    queryKey: ['student', 'fees'],
    queryFn: getStudentFees,
    enabled: authReady,
    staleTime,
    retry: 1,
  });
}

export function useStudentLeave() {
  const authReady = useAuthReady();
  return useQuery({
    queryKey: ['student', 'leave'],
    queryFn: getStudentLeave,
    enabled: authReady,
    staleTime,
    retry: 1,
  });
}

export function useStudentAlerts() {
  const authReady = useAuthReady();
  return useQuery({
    queryKey: ['student', 'alerts'],
    queryFn: getStudentAlerts,
    enabled: authReady,
    staleTime,
    retry: 1,
  });
}

export function useStudentNotices() {
  const authReady = useAuthReady();
  return useQuery({
    queryKey: ['student', 'notices'],
    queryFn: getStudentNotices,
    enabled: authReady,
    staleTime,
    retry: 1,
  });
}

export function useStudentProfile() {
  const authReady = useAuthReady();
  return useQuery({
    queryKey: ['student', 'profile'],
    queryFn: getStudentProfile,
    enabled: authReady,
    staleTime,
    retry: 1,
  });
}

export function useStudentHelpCenter() {
  const authReady = useAuthReady();
  return useQuery({
    queryKey: ['student', 'help'],
    queryFn: getStudentHelpCenter,
    enabled: authReady,
    staleTime,
    retry: 1,
  });
}

export function useAnnouncements(role: 'faculty' | 'student') {
  const authReady = useAuthReady();
  return useQuery({
    queryKey: [role, 'announcements'],
    queryFn: role === 'faculty' ? getFacultyAnnouncements : getStudentAnnouncements,
    enabled: authReady,
    staleTime,
    retry: 1,
  });
}

export function useFacultyAttendanceSession() {
  const authReady = useAuthReady();
  return useQuery({
    queryKey: ['faculty', 'attendance', 'session'],
    queryFn: getFacultyAttendanceSession,
    enabled: authReady,
    staleTime,
    retry: 1,
  });
}

export function useFacultySchedule() {
  return useQuery({
    queryKey: ['faculty', 'schedule'],
    queryFn: getFacultySchedule,
    staleTime,
    retry: 1,
  });
}

export function useFacultyLeave() {
  return useQuery({
    queryKey: ['faculty', 'leave'],
    queryFn: getFacultyLeave,
    staleTime,
    retry: 1,
  });
}

export function useFacultyStudyMaterial() {
  return useQuery({
    queryKey: ['faculty', 'study-material'],
    queryFn: getFacultyStudyMaterial,
    staleTime,
    retry: 1,
  });
}

export function useFacultyAssignmentsScreen() {
  return useQuery({
    queryKey: ['faculty', 'assignments', 'screen'],
    queryFn: getFacultyAssignmentsScreen,
    staleTime,
    retry: 1,
  });
}

export function useFacultyAiTools() {
  const authReady = useAuthReady();
  return useQuery({
    queryKey: ['faculty', 'ai-tools'],
    queryFn: getFacultyAiTools,
    enabled: authReady,
    staleTime,
    retry: 1,
  });
}

export function useFacultyMarksEntry() {
  return useQuery({
    queryKey: ['faculty', 'marks-entry'],
    queryFn: getFacultyMarksEntry,
    staleTime,
    retry: 1,
  });
}

export function useFacultySyllabus() {
  return useQuery({
    queryKey: ['faculty', 'syllabus'],
    queryFn: getFacultySyllabus,
    staleTime,
    retry: 1,
  });
}

export function useFacultyInvigilation() {
  return useQuery({
    queryKey: ['faculty', 'invigilation'],
    queryFn: getFacultyInvigilation,
    staleTime,
    retry: 1,
  });
}

export function useFacultySalary() {
  return useQuery({
    queryKey: ['faculty', 'salary'],
    queryFn: getFacultySalary,
    staleTime,
    retry: 1,
  });
}

export function useFacultyAlerts() {
  return useQuery({
    queryKey: ['faculty', 'alerts'],
    queryFn: getFacultyAlerts,
    staleTime,
    retry: 1,
  });
}

export function useFacultyProfile() {
  return useQuery({
    queryKey: ['faculty', 'profile'],
    queryFn: getFacultyProfile,
    staleTime,
    retry: 1,
  });
}

export function useFacultySettings() {
  const authReady = useAuthReady();
  return useQuery({
    queryKey: ['faculty', 'settings'],
    queryFn: getFacultySettings,
    enabled: authReady,
    staleTime,
    retry: 1,
  });
}

export function useFacultyHelpSupport() {
  const authReady = useAuthReady();
  return useQuery({
    queryKey: ['faculty', 'help-support'],
    queryFn: getFacultyHelpSupport,
    enabled: authReady,
    staleTime,
    retry: 1,
  });
}
