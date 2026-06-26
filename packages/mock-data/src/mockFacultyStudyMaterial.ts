import type { FacultyStudyMaterialData } from '@piiaura/types';

export const mockFacultyStudyMaterialData: FacultyStudyMaterialData = {
  title: 'Study Material',
  description: 'Manage and distribute class resources efficiently.',
  sessions: ['2023-24', '2024-25'],
  defaultSession: '2024-25',
  emptyUploadsTitle: 'No files yet',
  emptyUploadsDescription:
    "You haven't uploaded any study materials for this session yet.",
  tips: [
    {
      id: 'formats',
      text: 'Accepted formats: PDF, DOCX, PPTX up to 25MB.',
      variant: 'info',
    },
    {
      id: 'visibility',
      text: 'Uploaded files are immediately visible to students.',
      variant: 'visibility',
    },
  ],
};
