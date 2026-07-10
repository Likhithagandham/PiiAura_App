import type { Role, WalkthroughModuleOption, WalkthroughStepConfig } from '@piiaura/types';

export const WALKTHROUGH_STORAGE_KEY = 'piiaura.walkthrough.progress';

export const WALKTHROUGH_TARGETS = {
  STUDENT: {
    DASHBOARD_WELCOME: 'student-dashboard-welcome',
    DASHBOARD_STATS: 'student-dashboard-stats',
    DASHBOARD_NOTIFICATIONS: 'student-dashboard-notifications',
    DASHBOARD_ACTIVITY: 'student-dashboard-activity',
    TAB_BAR: 'student-tab-bar',
    HEADER_PROFILE: 'student-header-profile',
    HEADER_ACTIONS: 'student-header-actions',
  },
  FACULTY: {
    DASHBOARD_GREETING: 'faculty-dashboard-greeting',
    DASHBOARD_STATS: 'faculty-dashboard-stats',
    DASHBOARD_QUICK_ACTIONS: 'faculty-dashboard-quick-actions',
    DASHBOARD_ALERTS: 'faculty-dashboard-alerts',
    TAB_BAR: 'faculty-tab-bar',
    HEADER_PROFILE: 'faculty-header-profile',
    ATTENDANCE_SUMMARY: 'faculty-attendance-summary',
    ATTENDANCE_MARK_ALL: 'faculty-attendance-mark-all',
    ATTENDANCE_LIST: 'faculty-attendance-list',
    ATTENDANCE_SUBMIT: 'faculty-attendance-submit',
    SCHEDULE_ALERT: 'faculty-schedule-alert',
    SCHEDULE_OVERVIEW: 'faculty-schedule-overview',
    SCHEDULE_TABS: 'faculty-schedule-tabs',
    SCHEDULE_CALENDAR: 'faculty-schedule-calendar',
    MORE_AI: 'faculty-more-ai',
    MORE_ACADEMIC: 'faculty-more-academic',
    MORE_ADMIN: 'faculty-more-admin',
    MORE_SYSTEM: 'faculty-more-system',
    SYLLABUS_INTRO: 'faculty-syllabus-intro',
    SYLLABUS_FOCUS: 'faculty-syllabus-focus',
    SYLLABUS_LIST: 'faculty-syllabus-list',
    SYLLABUS_ADD: 'faculty-syllabus-add',
    ASSIGNMENTS_INTRO: 'faculty-assignments-intro',
    ASSIGNMENTS_CREATE: 'faculty-assignments-create',
    ASSIGNMENTS_LIST: 'faculty-assignments-list',
    MARKS_INTRO: 'faculty-marks-intro',
    MARKS_CONFIG: 'faculty-marks-config',
    MARKS_LIST: 'faculty-marks-list',
    MARKS_SAVE: 'faculty-marks-save',
    SALARY_STATS: 'faculty-salary-stats',
    SALARY_SLIP: 'faculty-salary-slip',
    SALARY_DOCUMENTS: 'faculty-salary-documents',
  },
} as const;

const SECTION_HIGHLIGHT_INSET = { top: 20, bottom: 20, left: 20, right: 20 };

const STUDENT_DASHBOARD_STEPS: WalkthroughStepConfig[] = [
  {
    id: 'student-dash-welcome',
    targetId: WALKTHROUGH_TARGETS.STUDENT.DASHBOARD_WELCOME,
    title: 'Welcome to PiiAura',
    description: 'Your student portal home shows a quick snapshot of academics, fees, and campus updates.',
    placement: 'bottom',
  },
  {
    id: 'student-dash-stats',
    targetId: WALKTHROUGH_TARGETS.STUDENT.DASHBOARD_STATS,
    title: 'Dashboard Cards',
    description: 'Track attendance, hall ticket status, and pending assignments at a glance.',
    placement: 'bottom',
  },
  {
    id: 'student-dash-notifications',
    targetId: WALKTHROUGH_TARGETS.STUDENT.DASHBOARD_NOTIFICATIONS,
    title: 'Notifications & Alerts',
    description: 'Important fee reminders and urgent campus alerts appear here on your dashboard.',
    placement: 'bottom',
  },
  {
    id: 'student-dash-activity',
    targetId: WALKTHROUGH_TARGETS.STUDENT.DASHBOARD_ACTIVITY,
    title: 'Recent Activity',
    description: 'Upcoming exams, today’s schedule, and announcements keep you up to date.',
    placement: 'top',
  },
  {
    id: 'student-dash-tabs',
    targetId: WALKTHROUGH_TARGETS.STUDENT.TAB_BAR,
    title: 'Navigation',
    description: 'Use Home, Learn, Schedule, and More to move between major sections.',
    placement: 'top',
  },
  {
    id: 'student-dash-profile',
    targetId: WALKTHROUGH_TARGETS.STUDENT.HEADER_PROFILE,
    title: 'Profile Menu',
    description: 'Tap your photo to open your profile and personal account details.',
    placement: 'bottom',
  },
  {
    id: 'student-dash-search',
    targetId: WALKTHROUGH_TARGETS.STUDENT.HEADER_ACTIONS,
    title: 'Search & Quick Actions',
    description: 'Search resources and check notifications from the top bar on your home screen.',
    placement: 'bottom',
  },
];

const FACULTY_DASHBOARD_STEPS: WalkthroughStepConfig[] = [
  {
    id: 'faculty-dash-greeting',
    targetId: WALKTHROUGH_TARGETS.FACULTY.DASHBOARD_GREETING,
    title: 'Faculty Dashboard',
    description: 'Your command center for classes, attendance, and daily teaching tasks.',
    placement: 'bottom',
  },
  {
    id: 'faculty-dash-stats',
    targetId: WALKTHROUGH_TARGETS.FACULTY.DASHBOARD_STATS,
    title: 'Dashboard Cards',
    description: 'Monitor attendance percentage, pending leave, and today’s sessions quickly.',
    placement: 'bottom',
  },
  {
    id: 'faculty-dash-actions',
    targetId: WALKTHROUGH_TARGETS.FACULTY.DASHBOARD_QUICK_ACTIONS,
    title: 'Quick Actions',
    description: 'Jump straight into marking attendance or posting announcements.',
    placement: 'top',
    highlightInset: { top: 4, bottom: 4, left: 4, right: 4 },
  },
  {
    id: 'faculty-dash-alerts',
    targetId: WALKTHROUGH_TARGETS.FACULTY.DASHBOARD_ALERTS,
    title: 'Priority Alerts',
    description: 'Pending tasks and reminders that need your attention show up here.',
    placement: 'top',
    highlightInset: { top: 4, bottom: 4, left: 4, right: 4 },
  },
  {
    id: 'faculty-dash-tabs',
    targetId: WALKTHROUGH_TARGETS.FACULTY.TAB_BAR,
    title: 'Navigation',
    description: 'Switch between Home, Attendance, Schedule, and More from the bottom bar.',
    placement: 'top',
    highlightInset: { top: 6, bottom: 10, left: 8, right: 8 },
  },
  {
    id: 'faculty-dash-profile',
    targetId: WALKTHROUGH_TARGETS.FACULTY.HEADER_PROFILE,
    title: 'Profile Menu',
    description: 'Open your faculty profile, settings, and account options from here.',
    placement: 'bottom',
    highlightInset: { top: 8, bottom: 8, left: 8, right: 8 },
  },
];

const STUDENT_MODULE_STEPS: Record<string, WalkthroughStepConfig[]> = {
  exams: [
    {
      id: 'student-exams-intro',
      title: 'Exams & Results',
      description: 'View your exam schedule, download hall tickets, and check subject-wise results.',
      placement: 'center',
    },
    {
      id: 'student-exams-tabs',
      title: 'Schedule vs Results',
      description: 'Switch between upcoming exams and your performance breakdown by unit.',
      placement: 'center',
    },
  ],
  fees: [
    {
      id: 'student-fees-intro',
      title: 'Fees',
      description: 'See your fee balance, payment history, and pay dues securely.',
      placement: 'center',
    },
  ],
  leave: [
    {
      id: 'student-leave-intro',
      title: 'My Leave',
      description: 'Apply for leave and track approval status for each request.',
      placement: 'center',
    },
  ],
  notices: [
    {
      id: 'student-notices-intro',
      title: 'Notices',
      description: 'Browse campus bulletins filtered by academic, events, and admin categories.',
      placement: 'center',
    },
  ],
  alerts: [
    {
      id: 'student-alerts-intro',
      title: 'Alerts',
      description: 'Personal pings for fees, assignments, attendance, and exam reminders.',
      placement: 'center',
    },
  ],
  homework: [
    {
      id: 'student-homework-intro',
      title: 'Homework',
      description: 'Review daily homework tasks and track what is due this week.',
      placement: 'center',
    },
  ],
  learn: [
    {
      id: 'student-learn-intro',
      title: 'Learn',
      description: 'Access study materials, upload assignments, and browse learning resources.',
      placement: 'center',
    },
  ],
  timetable: [
    {
      id: 'student-timetable-intro',
      title: 'Timetable',
      description: 'Switch between daily and weekly views to plan your class schedule.',
      placement: 'center',
    },
  ],
  attendance: [
    {
      id: 'student-attendance-intro',
      title: 'Attendance',
      description: 'Review your attendance records and subject-wise percentages.',
      placement: 'center',
    },
  ],
};

const FACULTY_MODULE_STEPS: Record<string, WalkthroughStepConfig[]> = {
  attendance: [
    {
      id: 'faculty-attendance-intro',
      targetId: WALKTHROUGH_TARGETS.FACULTY.ATTENDANCE_SUMMARY,
      title: 'Mark Attendance',
      description: 'Select a class session and mark students present or absent.',
      placement: 'bottom',
    },
    {
      id: 'faculty-attendance-mark-all',
      targetId: WALKTHROUGH_TARGETS.FACULTY.ATTENDANCE_MARK_ALL,
      title: 'Mark Everyone Quickly',
      description: 'Use Mark All Present when the full class is present, then adjust individual students if needed.',
      placement: 'bottom',
    },
    {
      id: 'faculty-attendance-list',
      targetId: WALKTHROUGH_TARGETS.FACULTY.ATTENDANCE_LIST,
      title: 'Student Roll Call',
      description: 'Toggle each student present or absent from this list.',
      placement: 'top',
    },
    {
      id: 'faculty-attendance-submit',
      targetId: WALKTHROUGH_TARGETS.FACULTY.ATTENDANCE_SUBMIT,
      title: 'Submit Attendance',
      description: 'Submit once you have finished the roll call for this period.',
      placement: 'top',
    },
  ],
  schedule: [
    {
      id: 'faculty-schedule-intro',
      targetId: WALKTHROUGH_TARGETS.FACULTY.SCHEDULE_ALERT,
      title: 'Schedule',
      description: 'Important schedule alerts and pending approvals appear first.',
      placement: 'bottom',
    },
    {
      id: 'faculty-schedule-overview',
      targetId: WALKTHROUGH_TARGETS.FACULTY.SCHEDULE_OVERVIEW,
      title: 'Attendance Overview',
      description: 'This summary shows your monthly attendance marking status.',
      placement: 'bottom',
    },
    {
      id: 'faculty-schedule-tabs',
      targetId: WALKTHROUGH_TARGETS.FACULTY.SCHEDULE_TABS,
      title: 'Calendar or Weekly View',
      description: 'Switch between the calendar overview and weekly teaching timetable.',
      placement: 'bottom',
    },
    {
      id: 'faculty-schedule-calendar',
      targetId: WALKTHROUGH_TARGETS.FACULTY.SCHEDULE_CALENDAR,
      title: 'Calendar Details',
      description: 'Tap dates to review attendance status and class details for the selected day.',
      placement: 'top',
    },
  ],
  more: [
    {
      id: 'faculty-more-ai',
      targetId: WALKTHROUGH_TARGETS.FACULTY.MORE_AI,
      title: 'AI Assistant',
      description: 'Use the assistant card for teaching support and productivity tools.',
      placement: 'bottom',
    },
    {
      id: 'faculty-more-academic',
      targetId: WALKTHROUGH_TARGETS.FACULTY.MORE_ACADEMIC,
      title: 'Academic Modules',
      description: 'Open study materials, assignments, syllabus, and invigilation from here.',
      placement: 'bottom',
      highlightInset: SECTION_HIGHLIGHT_INSET,
    },
    {
      id: 'faculty-more-admin',
      targetId: WALKTHROUGH_TARGETS.FACULTY.MORE_ADMIN,
      title: 'Administrative Modules',
      description: 'Manage leave, salary, marks entry, and admin alerts.',
      placement: 'top',
      highlightInset: SECTION_HIGHLIGHT_INSET,
    },
    {
      id: 'faculty-more-system',
      targetId: WALKTHROUGH_TARGETS.FACULTY.MORE_SYSTEM,
      title: 'Help and Settings',
      description: 'Access support, product tours, settings, and logout from this section.',
      placement: 'top',
    },
  ],
  leave: [
    {
      id: 'faculty-leave-intro',
      title: 'Leave Management',
      description: 'Apply for leave and review student leave requests awaiting approval.',
      placement: 'center',
    },
  ],
  assignments: [
    {
      id: 'faculty-assignments-intro',
      targetId: WALKTHROUGH_TARGETS.FACULTY.ASSIGNMENTS_INTRO,
      title: 'Assignments',
      description: 'Create assignments and review student submissions.',
      placement: 'bottom',
    },
    {
      id: 'faculty-assignments-create',
      targetId: WALKTHROUGH_TARGETS.FACULTY.ASSIGNMENTS_CREATE,
      title: 'Create Assignment',
      description: 'Write instructions, attach files, and publish a new task for your class.',
      placement: 'bottom',
      highlightInset: SECTION_HIGHLIGHT_INSET,
    },
    {
      id: 'faculty-assignments-list',
      targetId: WALKTHROUGH_TARGETS.FACULTY.ASSIGNMENTS_LIST,
      title: 'Current Assignments',
      description: 'Track submissions, send reminders, and manage published assignments.',
      placement: 'top',
      highlightInset: SECTION_HIGHLIGHT_INSET,
    },
  ],
  'marks-entry': [
    {
      id: 'faculty-marks-intro',
      targetId: WALKTHROUGH_TARGETS.FACULTY.MARKS_INTRO,
      title: 'Marks Entry',
      description: 'Enter internal assessment marks for your class students.',
      placement: 'bottom',
    },
    {
      id: 'faculty-marks-config',
      targetId: WALKTHROUGH_TARGETS.FACULTY.MARKS_CONFIG,
      title: 'Exam Setup',
      description: 'Choose class, subject, and examination before entering marks.',
      placement: 'bottom',
      highlightInset: SECTION_HIGHLIGHT_INSET,
    },
    {
      id: 'faculty-marks-list',
      targetId: WALKTHROUGH_TARGETS.FACULTY.MARKS_LIST,
      title: 'Student Marks',
      description: 'Enter marks for each enrolled student within the allowed maximum.',
      placement: 'top',
      highlightInset: SECTION_HIGHLIGHT_INSET,
    },
    {
      id: 'faculty-marks-save',
      targetId: WALKTHROUGH_TARGETS.FACULTY.MARKS_SAVE,
      title: 'Save Marks',
      description: 'Save all entered marks once you have finished the assessment.',
      placement: 'top',
    },
  ],
  'study-material': [
    {
      id: 'faculty-material-intro',
      title: 'Study Material',
      description: 'Upload and manage learning resources for your students.',
      placement: 'center',
    },
  ],
  syllabus: [
    {
      id: 'faculty-syllabus-intro',
      targetId: WALKTHROUGH_TARGETS.FACULTY.SYLLABUS_INTRO,
      title: 'Syllabus',
      description: 'Track subject coverage and update teaching progress.',
      placement: 'bottom',
    },
    {
      id: 'faculty-syllabus-focus',
      targetId: WALKTHROUGH_TARGETS.FACULTY.SYLLABUS_FOCUS,
      title: 'Current Focus',
      description: 'See the topic currently in progress and update teaching milestones.',
      placement: 'bottom',
    },
    {
      id: 'faculty-syllabus-list',
      targetId: WALKTHROUGH_TARGETS.FACULTY.SYLLABUS_LIST,
      title: 'Subject Progress',
      description: 'Each subject card shows completion percentage, status, and details.',
      placement: 'top',
    },
    {
      id: 'faculty-syllabus-add',
      targetId: WALKTHROUGH_TARGETS.FACULTY.SYLLABUS_ADD,
      title: 'Add Subjects',
      description: 'Add a subject when you need to begin tracking a new course.',
      placement: 'top',
    },
  ],
  invigilation: [
    {
      id: 'faculty-invigilation-intro',
      title: 'Invigilation',
      description: 'View assigned exam duties, halls, and invigilation schedules.',
      placement: 'center',
    },
  ],
  salary: [
    {
      id: 'faculty-salary-stats',
      targetId: WALKTHROUGH_TARGETS.FACULTY.SALARY_STATS,
      title: 'Salary Overview',
      description: 'See your net payable amount and last processed payroll at a glance.',
      placement: 'bottom',
      highlightInset: SECTION_HIGHLIGHT_INSET,
    },
    {
      id: 'faculty-salary-slip',
      targetId: WALKTHROUGH_TARGETS.FACULTY.SALARY_SLIP,
      title: 'Payslip',
      description: 'Download monthly payslips or notify accounts if payroll is pending.',
      placement: 'bottom',
      highlightInset: SECTION_HIGHLIGHT_INSET,
    },
    {
      id: 'faculty-salary-documents',
      targetId: WALKTHROUGH_TARGETS.FACULTY.SALARY_DOCUMENTS,
      title: 'Salary Documents',
      description: 'Access tax forms, salary certificates, and other payroll documents.',
      placement: 'top',
      highlightInset: SECTION_HIGHLIGHT_INSET,
    },
  ],
};

const STUDENT_MODULE_OPTIONS: WalkthroughModuleOption[] = [
  { id: 'exams', label: 'Exams & Results', description: 'Schedule, hall tickets, and grades' },
  { id: 'fees', label: 'Fees', description: 'Balance, payments, and dues' },
  { id: 'leave', label: 'My Leave', description: 'Apply and track leave requests' },
  { id: 'notices', label: 'Notices', description: 'Campus bulletins and announcements' },
  { id: 'alerts', label: 'Alerts', description: 'Personal reminders and pings' },
  { id: 'homework', label: 'Homework', description: 'Daily tasks and deadlines' },
  { id: 'learn', label: 'Learn', description: 'Study materials and resources' },
  { id: 'timetable', label: 'Timetable', description: 'Daily and weekly class schedule' },
  { id: 'attendance', label: 'Attendance', description: 'Your attendance records' },
];

const FACULTY_MODULE_OPTIONS: WalkthroughModuleOption[] = [
  { id: 'attendance', label: 'Attendance', description: 'Mark and submit class attendance' },
  { id: 'schedule', label: 'Schedule', description: 'Teaching timetable' },
  { id: 'more', label: 'More', description: 'All faculty modules and settings' },
  { id: 'leave', label: 'Leave', description: 'Leave requests and approvals' },
  { id: 'assignments', label: 'Assignments', description: 'Create and review work' },
  { id: 'marks-entry', label: 'Marks Entry', description: 'Internal assessment marks' },
  { id: 'study-material', label: 'Study Material', description: 'Upload learning resources' },
  { id: 'syllabus', label: 'Syllabus', description: 'Subject coverage tracking' },
  { id: 'invigilation', label: 'Invigilation', description: 'Exam duty assignments' },
  { id: 'salary', label: 'Salary', description: 'Payslips and payroll' },
];

const ADMIN_DASHBOARD_STEPS: WalkthroughStepConfig[] = [
  {
    id: 'admin-dash-intro',
    title: 'Admin Portal',
    description: 'Manage institute operations, users, and reports from your dashboard.',
    placement: 'center',
  },
];

export function getDashboardWalkthroughSteps(role: Role): WalkthroughStepConfig[] {
  switch (role) {
    case 'student':
      return STUDENT_DASHBOARD_STEPS;
    case 'faculty':
      return FACULTY_DASHBOARD_STEPS;
    case 'admin':
    case 'superadmin':
    case 'parent':
      return ADMIN_DASHBOARD_STEPS;
    default:
      return [];
  }
}

export function getModuleWalkthroughSteps(role: Role, moduleId: string): WalkthroughStepConfig[] {
  if (role === 'student') {
    return STUDENT_MODULE_STEPS[moduleId] ?? [];
  }
  if (role === 'faculty') {
    return FACULTY_MODULE_STEPS[moduleId] ?? [];
  }
  return [];
}

export function getModuleWalkthroughOptions(role: Role): WalkthroughModuleOption[] {
  switch (role) {
    case 'student':
      return STUDENT_MODULE_OPTIONS;
    case 'faculty':
      return FACULTY_MODULE_OPTIONS;
    default:
      return [];
  }
}
