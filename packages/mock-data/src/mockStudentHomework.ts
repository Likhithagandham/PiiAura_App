import type { StudentHomeworkData } from '@piiaura/types';

const tuesdayEntries = [
  {
    id: 'hw-1',
    kind: 'task' as const,
    metaLabel: 'Mathematics • Mr. Henderson',
    status: 'done' as const,
    statusLabel: 'DONE',
    title: 'Calculus Problem Set 4',
    description:
      'Complete exercises 12.1 to 12.5 from the textbook. Show all workings for partial credit.',
    attachmentLabel: 'PDF Attached',
    iconVariant: 'math' as const,
  },
  {
    id: 'hw-2',
    kind: 'task' as const,
    metaLabel: 'Advanced Biology • Dr. Aris',
    status: 'pending' as const,
    statusLabel: 'PENDING',
    title: 'Cell Mitosis Lab Report',
    description:
      'Draft the results section for the microscope observation conducted on Monday. Include labeled diagrams.',
    submitLabel: 'Submit Work',
    detailsLabel: 'View Details',
    iconVariant: 'science' as const,
  },
  {
    id: 'hw-3',
    kind: 'teacher_note' as const,
    metaLabel: 'Direct Note • Prof. Lawrence',
    description:
      '"The History seminar for tomorrow is moved to Room 402B. Please bring your annotated bibliography."',
    noteTimeLabel: '10:45 AM',
    iconVariant: 'note' as const,
    authorAvatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBaM4now7QLxbaC-6at9AMjvEIuARoYEp8ne1rw3K5kQH7G1MLWG-fTNi2BetVpI1v7CkFtVinUK4qu8iFccId8jfHIbk0_iSp5LDK-I2dW9A20re0mWAH3gmHNRJNSHxUxW9c0yGLp1Cx2aQRGjhtGPEQs88ZymiYVJd5BzZf8IyPkBsOJk2dVCF-n2dBz7TzWh6BLbcntWeQTe5Yexw942AvI0tXvYVWpnFRrlghp80QYj7P-JZZMZw6t85ia8MTHjuBThlvuTN7-',
  },
  {
    id: 'hw-4',
    kind: 'task' as const,
    metaLabel: 'English Lit • Ms. J. Smith',
    status: 'pending' as const,
    statusLabel: 'PENDING',
    title: 'Reading: Hamlet Act III',
    description: 'Read the selected scenes and prepare three questions for the Socratic seminar.',
    iconVariant: 'literature' as const,
  },
];

export const mockStudentHomeworkData: StudentHomeworkData = {
  overview: {
    progressLabel: 'Current Progress',
    title: 'Diary Overview',
    progressPercent: 78,
    summaryLabel: '12 of 15 tasks completed this week.',
    pendingLabel: 'Pending',
    pendingValue: '03 Tasks',
    nextDueLabel: 'Next Due',
    nextDueValue: 'Tomorrow',
  },
  diarySectionTitle: 'Academic Diary',
  monthLabel: 'September 2023',
  days: [
    { id: 'mon-18', weekdayShort: 'Mon', dayNumber: 18 },
    { id: 'tue-19', weekdayShort: 'Tue', dayNumber: 19 },
    { id: 'wed-20', weekdayShort: 'Wed', dayNumber: 20 },
    { id: 'thu-21', weekdayShort: 'Thu', dayNumber: 21 },
    { id: 'fri-22', weekdayShort: 'Fri', dayNumber: 22 },
  ],
  selectedDayId: 'tue-19',
  entriesByDay: {
    'mon-18': [],
    'tue-19': tuesdayEntries,
    'wed-20': [],
    'thu-21': [],
    'fri-22': [],
  },
};
