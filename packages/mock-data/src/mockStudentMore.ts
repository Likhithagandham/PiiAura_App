import type { StudentMoreData } from '@piiaura/types';

export const mockStudentMoreData: StudentMoreData = {
  heroTitle: 'Student Hub',
  heroDescription: 'Access your academic and campus resources in one place.',
  academicSectionTitle: 'Academic Hub',
  academicTiles: [
    { id: 'homework', label: 'Homework', subtitle: 'Tasks' },
    { id: 'exams', label: 'Exams', subtitle: 'Evaluation' },
  ],
  campusSectionTitle: 'Campus Services',
  campusTiles: [
    { id: 'fees', label: 'Fees', subtitle: 'Finance' },
    { id: 'leave', label: 'Leave', subtitle: 'Requests' },
    { id: 'notices', label: 'Notices', subtitle: 'Bulletins' },
    { id: 'alerts', label: 'Alerts', subtitle: 'Pings' },
  ],
  systemSectionTitle: 'System & Support',
  systemItems: [
    { id: 'account', label: 'Account' },
    { id: 'help', label: 'Help Center' },
    { id: 'logout', label: 'Logout' },
  ],
};
