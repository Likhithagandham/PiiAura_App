import type { StudentAlertsData } from '@piiaura/types';

export const mockStudentAlertsData: StudentAlertsData = {
  title: 'Alerts',
  description: 'Personal pings and reminders that need your attention.',
  unreadLabel: '3 unread',
  pings: [
    {
      id: 'alert-1',
      type: 'urgent',
      typeLabel: 'URGENT',
      dateLabel: 'Oct 24, 2023',
      title: 'Fee Deadline: Semester 4 Tuition',
      message:
        'Final call for Semester 4 tuition payments. A late fee of 5% applies after October 31st.',
      ctaLabel: 'Pay Now',
      unread: true,
    },
    {
      id: 'alert-2',
      type: 'warning',
      typeLabel: 'DUE SOON',
      dateLabel: 'Oct 24, 2023',
      title: 'Assignment Due Tomorrow',
      message: 'Operating Systems — Process Scheduling is due by 11:59 PM tomorrow.',
      ctaLabel: 'View Assignment',
      unread: true,
    },
    {
      id: 'alert-3',
      type: 'warning',
      typeLabel: 'ATTENDANCE',
      dateLabel: 'Oct 23, 2023',
      title: 'Attendance Below Threshold',
      message: 'Your attendance in Computer Networks is at 72%. Minimum required is 75%.',
      ctaLabel: 'View Details',
      unread: true,
    },
    {
      id: 'alert-4',
      type: 'info',
      typeLabel: 'EXAM',
      dateLabel: 'Oct 22, 2023',
      title: 'Mid-Term in 3 Days',
      message: 'Engineering Mathematics I exam is scheduled for Oct 27 in Lab A, Block 3.',
      ctaLabel: 'View Schedule',
      unread: false,
    },
  ],
  loadMoreLabel: 'Load More Alerts',
};
