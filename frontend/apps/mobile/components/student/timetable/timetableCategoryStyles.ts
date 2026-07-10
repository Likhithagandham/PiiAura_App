import type { StudentTimetableSlotCategory } from '@piiaura/types';

export const TIMETABLE_CATEGORY_COLORS: Record<
  StudentTimetableSlotCategory,
  {
    accent: string;
    bg: string;
    badgeBg: string;
    badgeText: string;
    weeklyBg: string;
    weeklyText: string;
  }
> = {
  core: {
    accent: '#00342B',
    bg: '#00342B',
    badgeBg: '#AFEFDD',
    badgeText: '#065043',
    weeklyBg: 'rgba(0,52,43,0.1)',
    weeklyText: '#00342B',
  },
  lab: {
    accent: '#482400',
    bg: '#482400',
    badgeBg: '#FFDCC2',
    badgeText: '#6D3A00',
    weeklyBg: 'rgba(72,36,0,0.1)',
    weeklyText: '#482400',
  },
  elective: {
    accent: '#516161',
    bg: '#516161',
    badgeBg: '#D4E6E5',
    badgeText: '#576867',
    weeklyBg: 'rgba(81,97,97,0.1)',
    weeklyText: '#516161',
  },
};
