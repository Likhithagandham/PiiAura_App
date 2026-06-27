import type { StudentLeaveData } from '@piiaura/types';

export const mockStudentLeaveData: StudentLeaveData = {
  title: 'Leave Request',
  description: 'Manage and track your time away from campus.',
  leaveTypes: [
    'Casual Leave',
    'Sick Leave',
    'Earned Leave',
    'Duty Leave',
    'Maternity/Paternity',
  ],
  formSubmitLabel: 'Submit Request',
  requestsTitle: 'My Requests',
  viewAllLabel: 'View All',
  tableHeaders: {
    dates: 'Dates',
    typeReason: 'Type/Reason',
    status: 'Status',
  },
  requests: [
    {
      id: 'leave-1',
      dateRange: 'Oct 12 - 14',
      durationLabel: '3 Days',
      leaveType: 'Casual',
      reason: 'Family Function',
      status: 'pending',
      statusLabel: 'PENDING',
    },
    {
      id: 'leave-2',
      dateRange: 'Sep 28 - 28',
      durationLabel: '1 Day',
      leaveType: 'Sick',
      reason: 'Routine Checkup',
      status: 'approved',
      statusLabel: 'APPROVED',
    },
    {
      id: 'leave-3',
      dateRange: 'Sep 05 - 08',
      durationLabel: '4 Days',
      leaveType: 'Earned',
      reason: 'Personal Vacation',
      status: 'rejected',
      statusLabel: 'REJECTED',
    },
  ],
  stats: {
    remainingCount: 12,
    remainingLabel: 'Remaining Leaves',
    availedCount: 8,
    availedLabel: 'Availed Leaves',
  },
};
