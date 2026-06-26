import type { FacultyMarksEntryData } from '@piiaura/types';

export const mockFacultyMarksEntryData: FacultyMarksEntryData = {
  title: 'Marks Entry',
  description: 'Update examination scores for your assigned classes with precision.',
  classes: ['Grade 10-A', 'Grade 10-B', 'Grade 9-C'],
  subjects: ['Mathematics', 'Physics', 'Chemistry'],
  examinations: ['Term 1 - Final Assessment', 'Monthly Test - October'],
  defaultClass: 'Grade 10-A',
  defaultSubject: 'Mathematics',
  defaultExamination: 'Term 1 - Final Assessment',
  maxMarks: 100,
  enrolledCount: 32,
  saveLabel: 'Save All Marks',
  students: [
    { id: 'stu-01', index: 1, name: 'Aarav Sharma', rollNo: '102401' },
    { id: 'stu-02', index: 2, name: 'Ishani Gupta', rollNo: '102402' },
    { id: 'stu-03', index: 3, name: 'Karthik Raja', rollNo: '102403' },
    { id: 'stu-04', index: 4, name: 'Meera Nair', rollNo: '102404' },
    { id: 'stu-05', index: 5, name: 'Rohan Verma', rollNo: '102405' },
  ],
};
