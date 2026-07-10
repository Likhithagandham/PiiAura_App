import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { FacultyCalendarDay } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';

function chunkWeeks(days: FacultyCalendarDay[]): FacultyCalendarDay[][] {
  const weeks: FacultyCalendarDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

const STATUS_STYLES: Record<
  FacultyCalendarDay['status'],
  { bg: string; border: string; dot: string; text?: string }
> = {
  present: { bg: '#E8F5E9', border: 'rgba(165,214,167,0.3)', dot: '#4CAF50', text: '#2E7D32' },
  absent: { bg: '#FFEBEE', border: 'rgba(239,154,154,0.3)', dot: colors.error, text: colors.error },
  leave: { bg: '#FFEBEE', border: 'rgba(239,154,154,0.3)', dot: colors.error, text: colors.error },
  holiday: { bg: '#E3F2FD', border: 'rgba(187,222,251,0.3)', dot: '#3B82F6', text: '#2563EB' },
  not_marked: { bg: '#FFFDE7', border: 'rgba(255,245,157,0.3)', dot: '#FBC02D', text: '#FBC02D' },
};

const WEEKEND_NEUTRAL = {
  bg: colors.surfaceContainer,
  border: 'rgba(191,201,196,0.3)',
  dot: colors.textMuted,
};

function isWeekend(isoDate: string): boolean {
  const day = new Date(`${isoDate}T12:00:00`).getDay();
  return day === 0 || day === 6;
}

function getCellStyle(day: FacultyCalendarDay) {
  if (!day.isInCurrentMonth) {
    return {
      bg: 'transparent',
      border: 'transparent',
      dot: 'transparent',
      muted: true,
    };
  }

  if (day.status === 'not_marked' && isWeekend(day.date)) {
    return { ...WEEKEND_NEUTRAL, muted: false };
  }

  const style = STATUS_STYLES[day.status];
  return { ...style, muted: false };
}

interface FacultyCalendarGridProps {
  daysOfWeek: string[];
  days: FacultyCalendarDay[];
  selectedDate: string;
  onSelectDate: (isoDate: string) => void;
}

export function FacultyCalendarGrid({
  daysOfWeek,
  days,
  selectedDate,
  onSelectDate,
}: FacultyCalendarGridProps) {
  const weeks = chunkWeeks(days);

  return (
    <View style={styles.container}>
      <View style={styles.weekRow}>
        {daysOfWeek.map((d) => (
          <Text key={d} style={styles.weekDay}>
            {d}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {weeks.map((week) => (
          <View key={week[0].date} style={styles.week}>
            {week.map((day) => {
              const cellStyle = getCellStyle(day);
              const isSelected = day.date === selectedDate;
              const showDot = day.isInCurrentMonth && day.status !== 'not_marked';

              return (
                <Pressable
                  key={day.date}
                  onPress={() => onSelectDate(day.date)}
                  style={[
                    styles.cell,
                    {
                      backgroundColor: cellStyle.bg,
                      borderColor: cellStyle.border,
                    },
                    !day.isInCurrentMonth && styles.outOfMonthCell,
                    isSelected && day.isInCurrentMonth && styles.selectedCell,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayNumber,
                      cellStyle.muted && styles.mutedDayNumber,
                      !day.isInCurrentMonth && styles.outOfMonthDayNumber,
                    ]}
                  >
                    {day.dayNumber}
                  </Text>
                  {showDot ? (
                    <View style={[styles.dot, { backgroundColor: cellStyle.dot }]} />
                  ) : (
                    <View style={styles.dotPlaceholder} />
                  )}
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  weekRow: {
    flexDirection: 'row',
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.semibold,
  },
  grid: {
    gap: spacing.xs,
  },
  week: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  cell: {
    flex: 1,
    minHeight: 72,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.sm,
    justifyContent: 'space-between',
    alignItems: 'stretch',
  },
  outOfMonthCell: {
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  selectedCell: {
    borderWidth: 2,
    borderColor: colors.primary,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  dayNumber: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  mutedDayNumber: {
    color: colors.textSecondary,
  },
  outOfMonthDayNumber: {
    color: colors.textMuted,
    fontWeight: typography.fontWeight.medium,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    alignSelf: 'center',
  },
  dotPlaceholder: {
    height: 6,
  },
});
