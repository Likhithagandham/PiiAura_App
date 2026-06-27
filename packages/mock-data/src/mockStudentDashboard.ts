import type { StudentDashboardData } from '@piiaura/types';

export const mockStudentDashboardData: StudentDashboardData = {
  welcomeName: 'Aarav Patel',
  portalLabel: 'BCS III • Student Portal',
  avatarUrl:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBy_f3XlGtJ5Ig-lWW3BEeKuexWZWfMedQSQbX6gAwE13vQqEKgMBD2Jx1uH8a9kjAfeB_A1nMxAcCyYsthp3vbfvNbGv11XcqmgbpqKl7VmvcwUeO58ZRyyyohHbfJLwat7KSRCFL7AKwStc_bRZ6G0MegqlIFWsvTODopr6kyQgybihRkLufoimTB1-SlVNCuw92r3oScTr0uas4EuAsoSgbzWg0AzNmmlqvRoenY01nPaxYPabindXzY81zh0epTkWSzMf8kBlcs',
  feeAlert: {
    amountLabel: 'Fee balance due: ₹35,500',
    detailsLabel: 'View details',
    payNowLabel: 'Pay Now',
  },
  attendance: {
    label: 'Attendance',
    percent: 100,
    badgeLabel: 'Perfect Record',
  },
  hallTicket: {
    label: 'Hall Ticket',
    status: 'Ready',
  },
  assignments: {
    label: 'Assignments',
    count: 4,
    countLabel: '04 Pending',
  },
  upcomingExamsTitle: 'Upcoming Exams',
  upcomingExamsCount: 2,
  featuredExam: {
    id: 'exam-1',
    subject: 'Engineering Mathematics I',
    dateTimeLabel: 'Date: 2026-06-24 • 10:00 AM',
    iconLetter: 'Σ',
  },
  nextExamLabel: 'Next: Digital Electronics - 2026-06-26',
  todayScheduleTitle: "Today's Schedule",
  todayScheduleEmpty: {
    title: 'No classes today',
    subtitle: 'Enjoy your self-study time!',
  },
  announcementsTitle: 'Announcements',
  announcementsEmpty: {
    title: 'No announcements',
    subtitle: 'Stay tuned for updates.',
  },
};
