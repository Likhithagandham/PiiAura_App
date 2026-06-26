import type { FacultyInvigilationData } from '@piiaura/types';

export const mockFacultyInvigilationData: FacultyInvigilationData = {
  title: 'Invigilation',
  description: 'View exam supervision duties assigned to you by the examinations office.',
  scopeLabel: 'School',
  alert: {
    title: '2 leave requests need your approval',
    description: 'Students are waiting for a decision on their applications.',
    actionLabel: 'Review now',
  },
  dutiesTitle: 'Upcoming duties',
  dutiesSubtitle: 'Scheduled by the examinations office and synced automatically.',
  refreshLabel: 'Refresh',
  duties: [
    {
      id: 'duty-exam-1',
      examSlot: 'Term 1 · Morning session',
      assignedBy: 'Examinations office',
      assignedByAuto: true,
      assignedAtLabel: '25 Jun 2026, 3:22 PM',
    },
  ],
  emptyDutiesMessage: 'No other duties scheduled for this week',
  stats: [
    { id: 'completed', label: 'Duties completed', value: '12', variant: 'secondary' },
    { id: 'hours', label: 'Hours logged', value: '36h', variant: 'neutral' },
  ],
};
