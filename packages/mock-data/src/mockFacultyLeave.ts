import type { FacultyLeaveData } from '@piiaura/types';

export const mockFacultyLeaveData: FacultyLeaveData = {
  title: 'My Leave',
  description: 'Track balances and request time off',
  leaveTypes: ['Annual Leave', 'Sick Leave', 'Casual Leave', 'Maternity/Paternity'],
  balances: [
    {
      id: 'annual',
      label: 'Annual Leave',
      used: 3,
      total: 15,
      icon: 'calendar',
    },
    {
      id: 'sick',
      label: 'Sick Leave',
      used: 2,
      total: 10,
      icon: 'medical',
    },
  ],
  recentRequests: [
    {
      id: 'req-1',
      leaveType: 'Annual Leave',
      dateRangeLabel: 'Oct 24 - Oct 26 (3 Days)',
      status: 'approved',
      metaLabel: 'Requested 2 days ago',
    },
    {
      id: 'req-2',
      leaveType: 'Sick Leave',
      dateRangeLabel: 'Nov 02 (1 Day)',
      status: 'pending',
      metaLabel: 'Requested today',
    },
    {
      id: 'req-3',
      leaveType: 'Casual Leave',
      dateRangeLabel: 'Sep 15 - Sep 16 (2 Days)',
      status: 'completed',
      metaLabel: 'Processed Sep 12',
    },
  ],
};
