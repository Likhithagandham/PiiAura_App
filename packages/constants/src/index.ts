import type { Role } from '@piiaura/types';

export const ROLES = {
  FACULTY: 'faculty',
  STUDENT: 'student',
  PARENT: 'parent',
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin',
} as const satisfies Record<string, Role>;

export const ACTIVE_ROLES: Role[] = [ROLES.FACULTY, ROLES.STUDENT];

export const ROUTES = {
  AUTH: {
    LOGIN: '/(auth)/login',
  },
  FACULTY: {
    DASHBOARD: '/(faculty)/dashboard',
    ATTENDANCE: '/(faculty)/attendance',
    SCHEDULE: '/(faculty)/schedule',
    MORE: '/(faculty)/more',
    ASSIGNMENTS: '/(faculty)/assignments',
    STUDENTS: '/(faculty)/students',
    ANNOUNCEMENTS: '/(faculty)/announcements',
    PROFILE: '/(faculty)/profile',
    LEAVE: '/(faculty)/leave',
  },
  STUDENT: {
    DASHBOARD: '/(student)/dashboard',
    TIMETABLE: '/(student)/timetable',
    ATTENDANCE: '/(student)/attendance',
    ASSIGNMENTS: '/(student)/assignments',
    GRADES: '/(student)/grades',
    ANNOUNCEMENTS: '/(student)/announcements',
    PROFILE: '/(student)/profile',
  },
} as const;

export const ROLE_HOME_ROUTE: Record<Role, string> = {
  faculty: ROUTES.FACULTY.DASHBOARD,
  student: ROUTES.STUDENT.DASHBOARD,
  parent: ROUTES.AUTH.LOGIN,
  admin: ROUTES.AUTH.LOGIN,
  superadmin: ROUTES.AUTH.LOGIN,
};

export const API_ENDPOINTS = {
  BASE_URL: 'https://api.piiaura.example.com',
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  ATTENDANCE: '/attendance',
  ASSIGNMENTS: '/assignments',
  ANNOUNCEMENTS: '/announcements',
  GRADES: '/grades',
  TIMETABLE: '/timetable',
  STUDENTS: '/students',
} as const;

export const APP_CONFIG = {
  APP_NAME: 'PiiAura',
  INSTITUTION_NAME: 'HORIZON ENGINEERING COLLEGE',
  QUERY_STALE_TIME_MS: 60_000,
} as const;
