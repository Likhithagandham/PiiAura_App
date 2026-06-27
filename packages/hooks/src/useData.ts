import { useQuery } from '@tanstack/react-query';
import {
  mockFacultyDashboardStats,
  mockFacultyDashboardData,
  mockFacultyAnnouncements,
  mockFacultyAttendanceSession,
  mockFacultyScheduleData,
  mockFacultyLeaveData,
  mockFacultyStudyMaterialData,
  mockFacultyAssignmentsData,
  mockFacultyAiToolsData,
  mockFacultyMarksEntryData,
  mockFacultySyllabusData,
  mockFacultyInvigilationData,
  mockFacultySalaryData,
  mockFacultyAlertsData,
  mockFacultyProfileData,
  mockFacultySettingsData,
  mockFacultyHelpSupportData,
  mockStudentDashboardStats,
  mockStudentDashboardData,
  mockStudentAnnouncements,
  mockStudentAttendance,
  mockStudentAssignments,
  mockStudentGrades,
  mockStudentTimetableData,
  mockStudentLearnData,
  mockStudentMoreData,
  mockStudentHomeworkData,
  mockStudentExamsData,
  mockStudentFeesData,
  mockStudentLeaveData,
  mockStudentAlertsData,
  mockStudentNoticesData,
  mockStudentProfileData,
  mockStudentHelpCenterData,
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
    queryFn: async () => mockStudentDashboardData,
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
    queryFn: async () => mockStudentTimetableData,
    staleTime,
  });
}

export function useStudentTimetable() {
  return useTimetable();
}

export function useStudentLearn() {
  return useQuery({
    queryKey: ['student', 'learn'],
    queryFn: async () => mockStudentLearnData,
    staleTime,
  });
}

export function useStudentMore() {
  return useQuery({
    queryKey: ['student', 'more'],
    queryFn: async () => mockStudentMoreData,
    staleTime,
  });
}

export function useStudentHomework() {
  return useQuery({
    queryKey: ['student', 'homework'],
    queryFn: async () => mockStudentHomeworkData,
    staleTime,
  });
}

export function useStudentExams() {
  return useQuery({
    queryKey: ['student', 'exams'],
    queryFn: async () => mockStudentExamsData,
    staleTime,
  });
}

export function useStudentFees() {
  return useQuery({
    queryKey: ['student', 'fees'],
    queryFn: async () => mockStudentFeesData,
    staleTime,
  });
}

export function useStudentLeave() {
  return useQuery({
    queryKey: ['student', 'leave'],
    queryFn: async () => mockStudentLeaveData,
    staleTime,
  });
}

export function useStudentAlerts() {
  return useQuery({
    queryKey: ['student', 'alerts'],
    queryFn: async () => mockStudentAlertsData,
    staleTime,
  });
}

export function useStudentNotices() {
  return useQuery({
    queryKey: ['student', 'notices'],
    queryFn: async () => mockStudentNoticesData,
    staleTime,
  });
}

export function useStudentProfile() {
  return useQuery({
    queryKey: ['student', 'profile'],
    queryFn: async () => mockStudentProfileData,
    staleTime,
  });
}

export function useStudentHelpCenter() {
  return useQuery({
    queryKey: ['student', 'help'],
    queryFn: async () => mockStudentHelpCenterData,
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

export function useFacultyStudyMaterial() {
  return useQuery({
    queryKey: ['faculty', 'study-material'],
    queryFn: async () => mockFacultyStudyMaterialData,
    staleTime,
  });
}

export function useFacultyAssignmentsScreen() {
  return useQuery({
    queryKey: ['faculty', 'assignments', 'screen'],
    queryFn: async () => mockFacultyAssignmentsData,
    staleTime,
  });
}

export function useFacultyAiTools() {
  return useQuery({
    queryKey: ['faculty', 'ai-tools'],
    queryFn: async () => mockFacultyAiToolsData,
    staleTime,
  });
}

export function useFacultyMarksEntry() {
  return useQuery({
    queryKey: ['faculty', 'marks-entry'],
    queryFn: async () => mockFacultyMarksEntryData,
    staleTime,
  });
}

export function useFacultySyllabus() {
  return useQuery({
    queryKey: ['faculty', 'syllabus'],
    queryFn: async () => mockFacultySyllabusData,
    staleTime,
  });
}

export function useFacultyInvigilation() {
  return useQuery({
    queryKey: ['faculty', 'invigilation'],
    queryFn: async () => mockFacultyInvigilationData,
    staleTime,
  });
}

export function useFacultySalary() {
  return useQuery({
    queryKey: ['faculty', 'salary'],
    queryFn: async () => mockFacultySalaryData,
    staleTime,
  });
}

export function useFacultyAlerts() {
  return useQuery({
    queryKey: ['faculty', 'alerts'],
    queryFn: async () => mockFacultyAlertsData,
    staleTime,
  });
}

export function useFacultyProfile() {
  return useQuery({
    queryKey: ['faculty', 'profile'],
    queryFn: async () => mockFacultyProfileData,
    staleTime,
  });
}

export function useFacultySettings() {
  return useQuery({
    queryKey: ['faculty', 'settings'],
    queryFn: async () => mockFacultySettingsData,
    staleTime,
  });
}

export function useFacultyHelpSupport() {
  return useQuery({
    queryKey: ['faculty', 'help-support'],
    queryFn: async () => mockFacultyHelpSupportData,
    staleTime,
  });
}
