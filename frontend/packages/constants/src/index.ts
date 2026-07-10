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
    SETTINGS: '/(faculty)/settings',
    LEAVE: '/(faculty)/leave',
    STUDY_MATERIAL: '/(faculty)/study-material',
    AI_TOOLS: '/(faculty)/ai-tools',
    MARKS_ENTRY: '/(faculty)/marks-entry',
    SYLLABUS: '/(faculty)/syllabus',
    INVIGILATION: '/(faculty)/invigilation',
    SALARY: '/(faculty)/salary',
    HELP: '/(faculty)/help-support',
  },
  STUDENT: {
    DASHBOARD: '/(student)/dashboard',
    TIMETABLE: '/(student)/timetable',
    ATTENDANCE: '/(student)/attendance',
    ASSIGNMENTS: '/(student)/assignments',
    GRADES: '/(student)/grades',
    ANNOUNCEMENTS: '/(student)/announcements',
    PROFILE: '/(student)/profile',
    MORE: '/(student)/more',
    SCHEDULE: '/(student)/timetable',
    LEARN: '/(student)/learn',
    HOMEWORK: '/(student)/homework',
    EXAMS: '/(student)/exams',
    FEES: '/(student)/fees',
    LEAVE: '/(student)/leave',
    ALERTS: '/(student)/alerts',
    NOTICES: '/(student)/notices',
    HELP: '/(student)/help',
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
  BASE_URL: 'http://localhost:8000',
  API_PREFIX: '/api/v1',
  AUTH: {
    LOGIN: '/api/v1/auth/login/',
    LOGIN_DISAMBIGUATE: '/api/v1/auth/login/disambiguate/',
    REFRESH: '/api/v1/auth/refresh/',
    LOGOUT: '/api/v1/auth/logout/',
    ME: '/api/v1/auth/me/',
  },
} as const;

export const APP_CONFIG = {
  APP_NAME: 'PiiAura',
  INSTITUTION_NAME: 'HORIZON ENGINEERING COLLEGE',
  QUERY_STALE_TIME_MS: 60_000,
} as const;

export {
  WALKTHROUGH_STORAGE_KEY,
  WALKTHROUGH_TARGETS,
  getDashboardWalkthroughSteps,
  getModuleWalkthroughSteps,
  getModuleWalkthroughOptions,
} from './walkthrough';
