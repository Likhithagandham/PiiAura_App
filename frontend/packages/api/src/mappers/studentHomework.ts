import type { StudentHomeworkData, StudentHomeworkEntry } from '@piiaura/types';

interface EduOSHomeworkItem {
  id?: string;
  classSectionId?: string;
  classLabel?: string;
  date?: string;
  title?: string;
  details?: string;
  status?: string;
  createdBy?: string;
  createdByUserId?: string | null;
  createdAt?: string;
  publishedAt?: string | null;
}

interface EduOSStudentHomeworkResponse {
  homework?: EduOSHomeworkItem[];
}

function dayIdFromDate(isoDate: string): string {
  return isoDate.slice(0, 10);
}

function buildWeekDays(anchor: Date): StudentHomeworkData['days'] {
  const start = new Date(anchor);
  start.setHours(0, 0, 0, 0);
  const mondayOffset = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - mondayOffset);

  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return {
      id: day.toISOString().slice(0, 10),
      weekdayShort: day.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
      dayNumber: day.getDate(),
    };
  });
}

function mapEntry(item: EduOSHomeworkItem): StudentHomeworkEntry {
  const status = item.status === 'done' || item.status === 'completed' ? 'done' : 'pending';
  return {
    id: item.id ?? `hw-${item.title ?? 'item'}`,
    kind: 'task',
    metaLabel: item.createdBy ? `By ${item.createdBy}` : item.classLabel || 'Homework',
    status,
    statusLabel: status === 'done' ? 'Done' : 'Pending',
    title: item.title ?? 'Homework',
    description: item.details?.trim() || 'No details provided.',
    submitLabel: 'Submit',
    detailsLabel: 'View details',
    iconVariant: 'note',
  };
}

export function mapEduOSStudentHomework(
  raw: EduOSStudentHomeworkResponse | null | undefined,
): StudentHomeworkData {
  const homework = raw?.homework ?? [];
  const today = new Date();
  const todayId = today.toISOString().slice(0, 10);
  const days = buildWeekDays(today);

  const entriesByDay: Record<string, StudentHomeworkEntry[]> = {};
  for (const day of days) {
    entriesByDay[day.id] = [];
  }

  for (const item of homework) {
    const dateId = item.date ? dayIdFromDate(item.date) : todayId;
    if (!entriesByDay[dateId]) {
      entriesByDay[dateId] = [];
    }
    entriesByDay[dateId].push(mapEntry(item));
  }

  const pendingCount = Object.values(entriesByDay)
    .flat()
    .filter((entry) => entry.status !== 'done').length;
  const totalCount = homework.length;
  const progressPercent =
    totalCount === 0 ? 0 : Math.round(((totalCount - pendingCount) / totalCount) * 100);

  const nextDue =
    homework
      .map((item) => item.date)
      .filter((value): value is string => Boolean(value))
      .sort()[0] ?? '—';

  return {
    overview: {
      progressLabel: 'Weekly progress',
      title: 'Homework Diary',
      progressPercent,
      summaryLabel: totalCount === 0 ? 'No homework assigned yet' : `${totalCount} assignment(s)`,
      pendingLabel: 'Pending',
      pendingValue: String(pendingCount),
      nextDueLabel: 'Next due',
      nextDueValue: nextDue === '—' ? '—' : nextDue.slice(5),
    },
    diarySectionTitle: 'This week',
    monthLabel: today.toLocaleDateString('en-US', { month: 'long' }).toUpperCase(),
    days,
    selectedDayId: days.find((day) => day.id === todayId)?.id ?? days[0]?.id ?? todayId,
    entriesByDay,
  };
}
