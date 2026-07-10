import type {
  Announcement,
  Assignment,
  AttendanceRecord,
  Grade,
  StudentAlertsData,
  StudentDashboardData,
  StudentExamsData,
  StudentFeesData,
  StudentHelpCenterData,
  StudentHomeworkData,
  StudentLearnData,
  StudentLeaveData,
  StudentMoreData,
  StudentNoticesData,
  StudentProfileData,
  StudentTimetableData,
} from '@piiaura/types';
import { apiClient } from './client';
import { API_PATHS } from './paths';

export async function getStudentDashboard(): Promise<StudentDashboardData> {
  const { data } = await apiClient.get<StudentDashboardData>(API_PATHS.auth.studentDashboard);
  return data;
}

export async function getStudentAttendance(): Promise<AttendanceRecord[]> {
  const { data } = await apiClient.get<AttendanceRecord[]>(API_PATHS.attendance.studentSummary);
  return data;
}

export async function getStudentAssignments(): Promise<Assignment[]> {
  const { data } = await apiClient.get<Assignment[]>(API_PATHS.examinations.studentAssignments);
  return data;
}

export async function getStudentGrades(): Promise<Grade[]> {
  const { data } = await apiClient.get<Grade[]>(API_PATHS.examinations.studentExams);
  return data;
}

export async function getStudentTimetable(): Promise<StudentTimetableData> {
  const { data } = await apiClient.get<StudentTimetableData>(API_PATHS.academics.studentTimetable);
  return data;
}

export async function getStudentLearn(): Promise<StudentLearnData> {
  const { data } = await apiClient.get<StudentLearnData>(API_PATHS.academics.studentStudyMaterials);
  return data;
}

/** More hub navigation is composed on the client; announcements feed is the primary API source. */
export async function getStudentMore(): Promise<StudentMoreData> {
  const { data } = await apiClient.get<StudentMoreData>(API_PATHS.communications.studentAnnouncements);
  return data;
}

export async function getStudentHomework(): Promise<StudentHomeworkData> {
  const { data } = await apiClient.get<StudentHomeworkData>(API_PATHS.coursework.studentHomework);
  return data;
}

export async function getStudentExams(): Promise<StudentExamsData> {
  const { data } = await apiClient.get<StudentExamsData>(API_PATHS.examinations.studentExams);
  return data;
}

export async function getStudentFees(): Promise<StudentFeesData> {
  const { data } = await apiClient.get<StudentFeesData>(API_PATHS.fees.studentFees);
  return data;
}

export async function getStudentLeave(): Promise<StudentLeaveData> {
  const { data } = await apiClient.get<StudentLeaveData>(API_PATHS.attendance.studentLeave);
  return data;
}

export async function getStudentAlerts(): Promise<StudentAlertsData> {
  const { data } = await apiClient.get<StudentAlertsData>(API_PATHS.communications.studentAnnouncements);
  return data;
}

export async function getStudentNotices(): Promise<StudentNoticesData> {
  const { data } = await apiClient.get<StudentNoticesData>(API_PATHS.communications.studentAnnouncements);
  return data;
}

export async function getStudentProfile(): Promise<StudentProfileData> {
  const { data } = await apiClient.get<StudentProfileData>(API_PATHS.auth.studentProfile);
  return data;
}

export async function getStudentHelpCenter(): Promise<StudentHelpCenterData> {
  const { data } = await apiClient.get<StudentHelpCenterData>('/api/v1/grievances/me/support/');
  return data;
}

export async function getStudentAnnouncements(): Promise<Announcement[]> {
  const { data } = await apiClient.get<Announcement[]>(API_PATHS.communications.studentAnnouncements);
  return data;
}

export async function getStudentDues(): Promise<unknown> {
  const { data } = await apiClient.get(API_PATHS.fees.studentDues);
  return data;
}
