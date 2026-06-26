import type { FacultyAlertsData } from '@piiaura/types';

export const mockFacultyAlertsData: FacultyAlertsData = {
  sectionTitle: 'Recent Notifications',
  sectionDescription: 'Stay updated with academic and administrative tasks.',
  markAllReadLabel: 'Mark all as read',
  filters: [
    { id: 'all', label: 'All' },
    { id: 'academic', label: 'Academic' },
    { id: 'administrative', label: 'Administrative' },
    { id: 'system', label: 'System' },
  ],
  emptyTitle: "You're all caught up!",
  emptyDescription:
    'No new alerts or notifications at the moment. Check back later for updates.',
  alerts: [
    {
      id: 'alert-attendance',
      category: 'administrative',
      severity: 'critical',
      severityLabel: 'Critical',
      timeLabel: '2h ago',
      title: 'Attendance not complete',
      description:
        'Attendance for Class 10-A (Engineering Math) has not been marked. Deadline: 4:00 PM today.',
      featured: true,
      actions: [
        {
          id: 'mark',
          label: 'Mark Attendance',
          variant: 'primary',
          route: '/(faculty)/attendance',
        },
        { id: 'dismiss', label: 'Dismiss', variant: 'dismiss' },
      ],
    },
    {
      id: 'alert-study',
      category: 'academic',
      severity: 'academic',
      severityLabel: 'Academic',
      timeLabel: '5h ago',
      title: 'Study Material Uploaded',
      description:
        'New course material for Engineering Mathematics I (Unit 3) is now live.',
      actions: [
        {
          id: 'view',
          label: 'View Material',
          variant: 'outline',
          route: '/(faculty)/study-material',
        },
      ],
    },
    {
      id: 'alert-leave',
      category: 'administrative',
      severity: 'warning',
      severityLabel: 'Warning',
      timeLabel: 'Yesterday',
      title: 'Pending Approvals',
      description:
        '2 Student Leave requests from the Civil Engineering department are pending your approval.',
      actions: [
        {
          id: 'review',
          label: 'Review',
          variant: 'primary',
          route: '/(faculty)/leave',
        },
      ],
    },
    {
      id: 'alert-salary',
      category: 'system',
      severity: 'system',
      severityLabel: 'System',
      timeLabel: '2 days ago',
      title: 'Salary Slip Available',
      description:
        'Salary slip for October 2023 has been generated and is ready for download.',
      actions: [
        {
          id: 'download',
          label: 'Download PDF',
          variant: 'muted',
          route: '/(faculty)/salary',
        },
      ],
    },
    {
      id: 'alert-maintenance',
      category: 'system',
      severity: 'update',
      severityLabel: 'Update',
      timeLabel: '3 days ago',
      title: 'Portal Maintenance',
      description:
        'Scheduled system maintenance this Sunday between 02:00 AM and 04:00 AM IST.',
      actions: [{ id: 'dismiss', label: 'Dismiss', variant: 'dismiss' }],
    },
  ],
};
