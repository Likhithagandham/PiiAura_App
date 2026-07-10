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

const staleTime = APP_CONFIG.QUERY_STALE_TIME_MS;

export function useFacultyDashboard() {
  return useQuery({
    queryKey: ['faculty', 'dashboard'],
    queryFn: getFacultyDashboard,
    staleTime,
    retry: 1,
  });
}

export function useStudentDashboard() {
  return useQuery({
    queryKey: ['student', 'dashboard'],
    queryFn: getStudentDashboard,
    staleTime,
    retry: 1,
  });
}

export function useAttendance(role: 'faculty' | 'student') {
  return useQuery({
    queryKey: [role, 'attendance'],
    queryFn: getStudentAttendance,
    enabled: role === 'student',
    staleTime,
    retry: 1,
  });
}

export function useAssignments(role: 'faculty' | 'student') {
  return useQuery({
    queryKey: [role, 'assignments'],
    queryFn: role === 'faculty' ? getFacultyAssignments : getStudentAssignments,
    staleTime,
    retry: 1,
  });
}

export function useGrades() {
  return useQuery({
    queryKey: ['student', 'grades'],
    queryFn: getStudentGrades,
    staleTime,
    retry: 1,
  });
}

export function useTimetable() {
  return useQuery({
    queryKey: ['student', 'timetable'],
    queryFn: getStudentTimetable,
    staleTime,
    retry: 1,
  });
}

export function useStudentTimetable() {
  return useTimetable();
}

export function useStudentLearn() {
  return useQuery({
    queryKey: ['student', 'learn'],
    queryFn: getStudentLearn,
    staleTime,
    retry: 1,
  });
}

export function useStudentMore() {
  return useQuery({
    queryKey: ['student', 'more'],
    queryFn: getStudentMore,
    staleTime,
    retry: 1,
  });
}

export function useStudentHomework() {
  return useQuery({
    queryKey: ['student', 'homework'],
    queryFn: getStudentHomework,
    staleTime,
    retry: 1,
  });
}

export function useStudentExams() {
  return useQuery({
    queryKey: ['student', 'exams'],
    queryFn: getStudentExams,
    staleTime,
    retry: 1,
  });
}

export function useStudentFees() {
  return useQuery({
    queryKey: ['student', 'fees'],
    queryFn: getStudentFees,
    staleTime,
    retry: 1,
  });
}

export function useStudentLeave() {
  return useQuery({
    queryKey: ['student', 'leave'],
    queryFn: getStudentLeave,
    staleTime,
    retry: 1,
  });
}

export function useStudentAlerts() {
  return useQuery({
    queryKey: ['student', 'alerts'],
    queryFn: getStudentAlerts,
    staleTime,
    retry: 1,
  });
}

export function useStudentNotices() {
  return useQuery({
    queryKey: ['student', 'notices'],
    queryFn: getStudentNotices,
    staleTime,
    retry: 1,
  });
}

export function useStudentProfile() {
  return useQuery({
    queryKey: ['student', 'profile'],
    queryFn: getStudentProfile,
    staleTime,
    retry: 1,
  });
}

export function useStudentHelpCenter() {
  return useQuery({
    queryKey: ['student', 'help'],
    queryFn: getStudentHelpCenter,
    staleTime,
    retry: 1,
  });
}

export function useAnnouncements(role: 'faculty' | 'student') {
  return useQuery({
    queryKey: [role, 'announcements'],
    queryFn: role === 'faculty' ? getFacultyAnnouncements : getStudentAnnouncements,
    staleTime,
    retry: 1,
  });
}

export function useFacultyAttendanceSession() {
  return useQuery({
    queryKey: ['faculty', 'attendance', 'session'],
    queryFn: getFacultyAttendanceSession,
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
  return useQuery({
    queryKey: ['faculty', 'ai-tools'],
    queryFn: getFacultyAiTools,
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
  return useQuery({
    queryKey: ['faculty', 'settings'],
    queryFn: getFacultySettings,
    staleTime,
    retry: 1,
  });
}

export function useFacultyHelpSupport() {
  return useQuery({
    queryKey: ['faculty', 'help-support'],
    queryFn: getFacultyHelpSupport,
    staleTime,
    retry: 1,
  });
}
