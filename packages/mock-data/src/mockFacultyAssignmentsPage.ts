import type { FacultyAssignmentsData } from '@piiaura/types';

export const mockFacultyAssignmentsData: FacultyAssignmentsData = {
  title: 'Assignments',
  description: 'Create and manage student task submissions.',
  classes: ['Grade 10-A', 'Grade 10-B', 'Grade 9-C'],
  subjects: ['Mathematics', 'Physics', 'Science'],
  currentAssignments: [
    {
      id: 'asg-trig',
      title: 'Trigonometry Basics',
      subject: 'Math',
      className: 'Grade 10-A',
      dueLabel: 'Due Oct 24',
      submittedCount: 24,
      totalStudents: 30,
      accentColor: 'primary',
    },
    {
      id: 'asg-physics',
      title: 'Laws of Motion Lab Report',
      subject: 'Physics',
      className: 'Grade 9-C',
      dueLabel: 'Due Oct 28',
      submittedCount: 12,
      totalStudents: 28,
      accentColor: 'tertiary',
    },
  ],
  reviewEmptyTitle: 'Awaiting Review',
  reviewEmptyDescription:
    'No new submissions need grading right now. High-five for staying ahead!',
  reviewRefreshLabel: 'Refresh Submissions',
};
