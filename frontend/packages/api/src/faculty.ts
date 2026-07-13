import type {
  Announcement,
  Assignment,
  FacultyAiToolsData,
  FacultyAlertsData,
  FacultyAssignmentsData,
  FacultyAttendanceSession,
  FacultyHelpSupportData,
  FacultyInvigilationData,
  FacultyLeaveData,
  FacultyMarksEntryData,
  FacultyProfileData,
  FacultySalaryData,
  FacultyScheduleData,
  FacultySettingsData,
  FacultyStudyMaterialData,
  FacultySyllabusData,
} from '@piiaura/types';
import { apiClient } from './client';
import {
  mapEduOSFacultyDashboard,
  type FacultyDashboardResponse,
} from './mappers/facultyDashboard';
import { API_PATHS } from './paths';

export type { FacultyDashboardResponse };

export async function getFacultyDashboard(): Promise<FacultyDashboardResponse> {
  const { data } = await apiClient.get(API_PATHS.auth.facultyDashboard);
  return mapEduOSFacultyDashboard(data);
}

export async function getFacultyAttendanceSession(): Promise<FacultyAttendanceSession> {
  const { data } = await apiClient.get<FacultyAttendanceSession>(API_PATHS.attendance.facultyAttendance);
  return data;
}

export async function getFacultySchedule(): Promise<FacultyScheduleData> {
  const { data } = await apiClient.get<FacultyScheduleData>(API_PATHS.academics.facultyTimetable);
  return data;
}

export async function getFacultyLeave(): Promise<FacultyLeaveData> {
  const { data } = await apiClient.get<FacultyLeaveData>(API_PATHS.hr.facultyLeave);
  return data;
}

export async function getFacultyStudyMaterial(): Promise<FacultyStudyMaterialData> {
  const { data } = await apiClient.get<FacultyStudyMaterialData>(API_PATHS.academics.facultyStudyMaterials);
  return data;
}

export async function getFacultyAssignmentsScreen(): Promise<FacultyAssignmentsData> {
  const { data } = await apiClient.get<FacultyAssignmentsData>(API_PATHS.examinations.facultyTeachingAssignments);
  return data;
}

/** AI tools endpoint is planned in EduOS integrations — not yet exposed on mobile API. */
export async function getFacultyAiTools(): Promise<FacultyAiToolsData> {
  const { data } = await apiClient.get<FacultyAiToolsData>('/api/v1/integrations/ai-tools/');
  return data;
}

export async function getFacultyMarksEntry(): Promise<FacultyMarksEntryData> {
  const { data } = await apiClient.get<FacultyMarksEntryData>(API_PATHS.examinations.facultyMarks);
  return data;
}

export async function getFacultySyllabus(): Promise<FacultySyllabusData> {
  const { data } = await apiClient.get<FacultySyllabusData>(API_PATHS.academics.facultySyllabus);
  return data;
}

export async function getFacultyInvigilation(): Promise<FacultyInvigilationData> {
  const { data } = await apiClient.get<FacultyInvigilationData>(API_PATHS.examinations.facultyInvigilation);
  return data;
}

export async function getFacultySalary(): Promise<FacultySalaryData> {
  const { data } = await apiClient.get<FacultySalaryData>(API_PATHS.hr.facultyPayslip);
  return data;
}

export async function getFacultyAlerts(): Promise<FacultyAlertsData> {
  const { data } = await apiClient.get<FacultyAlertsData>(API_PATHS.communications.facultyAnnouncements);
  return data;
}

export async function getFacultyProfile(): Promise<FacultyProfileData> {
  const { data } = await apiClient.get<FacultyProfileData>(API_PATHS.auth.facultyProfile);
  return data;
}

export async function getFacultySettings(): Promise<FacultySettingsData> {
  const { data } = await apiClient.get<FacultySettingsData>(API_PATHS.communications.notificationPreferences);
  return data;
}

export async function getFacultyHelpSupport(): Promise<FacultyHelpSupportData> {
  const { data } = await apiClient.get<FacultyHelpSupportData>('/api/v1/grievances/me/support/');
  return data;
}

export async function getFacultyAnnouncements(): Promise<Announcement[]> {
  const { data } = await apiClient.get<Announcement[]>(API_PATHS.communications.facultyAnnouncements);
  return data;
}

export async function getFacultyAssignments(): Promise<Assignment[]> {
  const { data } = await apiClient.get<Assignment[]>(API_PATHS.examinations.facultyTeachingAssignments);
  return data;
}

export async function saveFacultyInternalMarks(payload: unknown): Promise<void> {
  await apiClient.post(API_PATHS.examinations.facultyInternalMarksSave, payload);
}

export async function bulkMarkFacultyAttendance(payload: unknown): Promise<void> {
  await apiClient.post(API_PATHS.attendance.facultyBulkMark, payload);
}
