import type { FacultySyllabusData } from '@piiaura/types';

export const mockFacultySyllabusData: FacultySyllabusData = {
  title: 'Syllabus completion',
  description: 'Track your teaching milestones for Academic Year 2023-24',
  currentFocus: {
    subjectLabel: 'Mathematics - Grade 10',
    percent: 78,
    nextChapter: 'Next Chapter: Trigonometry',
    updateTopicsLabel: 'Update Topics',
  },
  otherSubjectsLabel: 'Other Subjects',
  subjects: [
    {
      id: 'syll-physics',
      name: 'Physics',
      classLabel: 'Class 12 - Section B',
      percent: 50,
      status: 'pending-review',
      statusLabel: 'Pending Review',
      lastUpdatedLabel: 'Last updated 2 days ago',
      chapters: [
        { id: 'phy-1', title: 'Electrostatics', status: 'completed' },
        { id: 'phy-2', title: 'Current Electricity', status: 'completed' },
        { id: 'phy-3', title: 'Magnetic Effects', status: 'current' },
        { id: 'phy-4', title: 'Electromagnetic Induction', status: 'upcoming' },
        { id: 'phy-5', title: 'Optics', status: 'upcoming' },
      ],
    },
    {
      id: 'syll-chemistry',
      name: 'Chemistry',
      classLabel: 'Class 11 - Section A',
      percent: 65,
      status: 'on-track',
      statusLabel: 'On Track',
      lastUpdatedLabel: 'Updated today',
      chapters: [
        { id: 'chem-1', title: 'Atomic Structure', status: 'completed' },
        { id: 'chem-2', title: 'Chemical Bonding', status: 'completed' },
        { id: 'chem-3', title: 'Thermodynamics', status: 'completed' },
        { id: 'chem-4', title: 'Equilibrium', status: 'current' },
        { id: 'chem-5', title: 'Redox Reactions', status: 'upcoming' },
      ],
    },
    {
      id: 'syll-biology',
      name: 'Biology',
      classLabel: 'Class 10 - Section C',
      percent: 82,
      status: 'on-track',
      statusLabel: 'On Track',
      lastUpdatedLabel: 'Updated 1 week ago',
      chapters: [
        { id: 'bio-1', title: 'Life Processes', status: 'completed' },
        { id: 'bio-2', title: 'Control & Coordination', status: 'completed' },
        { id: 'bio-3', title: 'Reproduction', status: 'completed' },
        { id: 'bio-4', title: 'Heredity & Evolution', status: 'current' },
        { id: 'bio-5', title: 'Environment', status: 'upcoming' },
      ],
    },
  ],
  addSubjectLabel: 'Add Another Subject',
  addSubjectOptions: {
    subjectNames: ['Computer Science', 'English', 'Economics', 'History'],
    classLabels: [
      'Class 9 - Section A',
      'Class 10 - Section A',
      'Class 11 - Section B',
      'Class 12 - Section C',
    ],
  },
};
