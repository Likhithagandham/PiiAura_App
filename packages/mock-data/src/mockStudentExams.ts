import type { StudentExamsData } from '@piiaura/types';

const MATH_SPARKLINE = {
  sparklinePath: 'M0,35 L20,32 L40,34 L60,15 L80,18 L100,5',
  sparklineFillPath: 'M0,35 L20,32 L40,34 L60,15 L80,18 L100,5 L100,40 L0,40 Z',
  strokeColor: '#00342B',
  fillColor: 'rgba(0, 77, 64, 0.1)',
};

const PHYSICS_SPARKLINE = {
  sparklinePath: 'M0,38 L20,35 L40,30 L60,32 L80,15 L100,10',
  sparklineFillPath: 'M0,38 L20,35 L40,30 L60,32 L80,15 L100,10 L100,40 L0,40 Z',
  strokeColor: '#FF972C',
  fillColor: 'rgba(255, 151, 44, 0.1)',
};

const CHEMISTRY_PENDING = {
  id: 'chem',
  subject: 'Chemistry',
  sparklinePath: '',
  sparklineFillPath: '',
  strokeColor: '',
  fillColor: '',
  pendingMessage: 'Results pending publication',
  dimmed: true,
};

export const mockStudentExamsData: StudentExamsData = {
  scheduleTabLabel: 'Schedule',
  resultsTabLabel: 'Results',
  upcomingExamsTitle: 'Upcoming Exams',
  hallTicketLabel: 'Hall Ticket',
  featuredExam: {
    trendsTitle: 'Performance Trends',
    growthLabel: '+12% growth',
    trendBars: [
      { id: 't1', heightPercent: 40, hoverLabel: '65%' },
      { id: 't2', heightPercent: 60 },
      { id: 't3', heightPercent: 55 },
      { id: 't4', heightPercent: 80 },
      { id: 't5', heightPercent: 92 },
    ],
    yourScoreLabel: 'Your Score',
    yourScoreValue: '65%',
    classAvgLabel: 'Class Avg',
    classAvgValue: '58%',
    nextPaperBadge: 'Next Paper',
    nextPaperTitle: 'Engineering Mathematics I',
    dateLabel: 'Oct 24, 2023',
    locationLabel: 'Lab A, Block 3',
  },
  upcomingExams: [
    {
      id: 'exam-2',
      monthShort: 'Oct',
      dayNumber: 26,
      subject: 'Physics II',
      detailsLabel: '09:00 - 10:30 • Main Hall',
    },
    {
      id: 'exam-3',
      monthShort: 'Oct',
      dayNumber: 29,
      subject: 'Digital Electronics',
      detailsLabel: '14:00 - 15:30 • Lab B',
    },
    {
      id: 'exam-4',
      monthShort: 'Nov',
      dayNumber: 2,
      subject: 'Thermodynamics',
      detailsLabel: '11:00 - 12:30 • Room 204',
      dimmed: true,
    },
  ],
  results: {
    overviewTitle: 'Performance overview',
    breakdownTitle: 'Detailed Breakdown',
    units: [
      {
        id: 'unit-2',
        label: 'Unit 2',
        overview: {
          averagePercent: 72,
          accentPercent: 30,
          averageLabel: 'Unit 2 average',
          barStats: [
            { id: 'math', shortLabel: 'Math', percent: 78, variant: 'primary' },
            { id: 'phys', shortLabel: 'Phys', percent: 65, variant: 'accent' },
          ],
          barCaption: 'Score by subject — Unit 2',
        },
        breakdown: [
          {
            id: 'math',
            subject: 'Mathematics',
            unitScores: [
              { unitLabel: 'Unit 1: 72%', percent: 72, isActive: false },
              { unitLabel: 'Unit 2: 78%', percent: 78, isActive: true },
            ],
            ...MATH_SPARKLINE,
          },
          {
            id: 'phys',
            subject: 'Physics',
            unitScores: [
              { unitLabel: 'Unit 1: 58%', percent: 58, isActive: false },
              { unitLabel: 'Unit 2: 65%', percent: 65, isActive: true },
            ],
            ...PHYSICS_SPARKLINE,
          },
          CHEMISTRY_PENDING,
        ],
      },
      {
        id: 'unit-1',
        label: 'Unit 1',
        overview: {
          averagePercent: 65,
          accentPercent: 25,
          averageLabel: 'Unit 1 average',
          barStats: [
            { id: 'math', shortLabel: 'Math', percent: 72, variant: 'primary' },
            { id: 'phys', shortLabel: 'Phys', percent: 58, variant: 'accent' },
          ],
          barCaption: 'Score by subject — Unit 1',
        },
        breakdown: [
          {
            id: 'math',
            subject: 'Mathematics',
            unitScores: [
              { unitLabel: 'Unit 1: 72%', percent: 72, isActive: true },
              { unitLabel: 'Unit 2: 78%', percent: 78, isActive: false },
            ],
            ...MATH_SPARKLINE,
          },
          {
            id: 'phys',
            subject: 'Physics',
            unitScores: [
              { unitLabel: 'Unit 1: 58%', percent: 58, isActive: true },
              { unitLabel: 'Unit 2: 65%', percent: 65, isActive: false },
            ],
            ...PHYSICS_SPARKLINE,
          },
          CHEMISTRY_PENDING,
        ],
      },
    ],
  },
};
