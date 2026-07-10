/**
 * EduOS-backend API paths.
 * @see https://github.com/Likhithagandham/EduOS-backend
 */
export const API_PATHS = {
  auth: {
    login: '/api/v1/auth/login/',
    loginDisambiguate: '/api/v1/auth/login/disambiguate/',
    refresh: '/api/v1/auth/refresh/',
    logout: '/api/v1/auth/logout/',
    me: '/api/v1/auth/me/',
    studentDashboard: '/api/v1/auth/me/dashboard/',
    facultyDashboard: '/api/v1/auth/me/faculty-dashboard/',
    studentProfile: '/api/v1/auth/me/student-profile/',
    facultyProfile: '/api/v1/auth/me/faculty-profile/',
    walkthroughs: '/api/v1/auth/me/walkthroughs/',
  },
  attendance: {
    facultyAttendance: '/api/v1/attendance/faculty/attendance/',
    facultyLive: '/api/v1/attendance/faculty/live/',
    facultyBulkMark: '/api/v1/attendance/faculty/records/bulk-mark/',
    facultyLeaveReview: '/api/v1/attendance/faculty/leave/',
    studentSummary: '/api/v1/attendance/me/summary/',
    studentLeave: '/api/v1/attendance/me/leave/',
  },
  academics: {
    studentTimetable: '/api/v1/academics/me/timetable/',
    facultyTimetable: '/api/v1/academics/faculty/timetable/',
    studentStudyMaterials: '/api/v1/academics/me/study-materials/',
    facultyStudyMaterials: '/api/v1/academics/faculty/study-materials/',
    facultySyllabus: '/api/v1/academics/faculty/syllabus/',
  },
  examinations: {
    studentExams: '/api/v1/examinations/me/exams/',
    studentAssignments: '/api/v1/examinations/me/assignments/',
    facultyTeachingAssignments: '/api/v1/examinations/me/teaching/assignments/',
    facultyMarks: '/api/v1/examinations/me/marks/',
    facultyInternalMarksSave: '/api/v1/examinations/me/internal-marks/',
    facultyInvigilation: '/api/v1/examinations/me/invigilation/',
  },
  fees: {
    studentFees: '/api/v1/fees/me/fees/',
    studentDues: '/api/v1/fees/me/dues/',
  },
  hr: {
    facultyLeave: '/api/v1/hr/me/leave/',
    facultyPayslip: '/api/v1/hr/me/payslip/',
  },
  communications: {
    studentAnnouncements: '/api/v1/communications/announcements/me/',
    facultyAnnouncements: '/api/v1/communications/announcements/faculty/',
    notificationPreferences: '/api/v1/communications/notification-preferences/',
  },
  coursework: {
    studentHomework: '/api/v1/coursework/student/homework/',
    facultyHomework: '/api/v1/coursework/me/homework/',
  },
} as const;
