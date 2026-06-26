import type { FacultyAiToolsData } from '@piiaura/types';

export const mockFacultyAiToolsData: FacultyAiToolsData = {
  poweredByLabel: 'Powered by EduGen AI',
  title: 'AI Tools',
  description: 'Generate high-quality assessments and study materials in seconds.',
  subjects: [
    'Advanced Mathematics II',
    'Quantum Physics',
    'Organic Chemistry',
    'Modern History',
  ],
  defaultSubject: 'Advanced Mathematics II',
  defaultDifficulty: 'hard',
  questionTypes: [
    {
      id: 'mcq',
      label: 'MCQ',
      description: 'Multiple choice questions',
      defaultChecked: true,
    },
    {
      id: 'short',
      label: 'Short Answer',
      description: '2-3 sentence responses',
      defaultChecked: true,
    },
    {
      id: 'long',
      label: 'Long Answer',
      description: 'Detailed essay type answers',
      defaultChecked: false,
    },
  ],
  recentGenerations: [
    {
      id: 'gen-math',
      title: 'Math Quiz',
      timeLabel: '2 days ago',
      variant: 'secondary',
    },
    {
      id: 'gen-phys',
      title: 'Phys Unit 1',
      timeLabel: 'Yesterday',
      variant: 'neutral',
    },
  ],
  topicQuiz: {
    title: 'AI Quiz Generator',
    description:
      'Generate personalized topic quizzes for your students in seconds using academic-grade AI.',
    subjects: [
      'Advanced Mathematics II',
      'Data Structures & Algorithms',
      'Operating Systems',
      'Digital Electronics',
    ],
    defaultSubject: 'Advanced Mathematics II',
    defaultQuestionCount: '20',
    timerOptions: ['None', '10 mins', '15 mins', '30 mins', '60 mins'],
    defaultTimer: '15 mins',
    defaultDifficulty: 'medium',
    recentQuizzes: [
      {
        id: 'quiz-calc',
        title: 'Calculus Topic Test',
        metaLabel: 'Yesterday, 04:30 PM • 15 Qs',
      },
      {
        id: 'quiz-physics',
        title: 'Physics Quiz 1: Optic...',
        metaLabel: '22 Oct, 11:15 AM • 20 Qs',
      },
      {
        id: 'quiz-python',
        title: 'Python Fundamentals',
        metaLabel: '20 Oct, 09:00 AM • 10 Qs',
      },
    ],
    engagementBanner: {
      eyebrow: 'Enhanced Learning',
      title: 'Boost Classroom Engagement',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuD6GQVmn44xy6fnnIC3O14xVWvbiYBcigiMBJ5pSpG5gcZ0cO57SSwu3vSHzr21pyvlaDFyxWT4q3FWauJaS8MYC2V2JVSKwKn4yxQgpmZnT2TfSQKK2UmYQo312HaYlAI_Avawx6gyIgKDCQ3yBf0zKNC0KUGoNNZB9TcI-FPGuTAFABWd_3kD7DpNQAgfBF1Hh5O_KLznqaJZNHi5XX5_Y_srBw1RicPhnGF7RA4FKb1RqP_gmlHIk6tZRP1LLBHT6ok98IY4XEgN',
    },
  },
};
