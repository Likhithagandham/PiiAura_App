import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import type { StudentHomeworkDayOption } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface StudentHomeworkDayScrollerProps {
  days: StudentHomeworkDayOption[];
  selectedDayId: string;
  onSelectDay: (dayId: string) => void;
}

export function StudentHomeworkDayScroller({
  days,
  selectedDayId,
  onSelectDay,
}: StudentHomeworkDayScrollerProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {days.map((day) => {
        const isSelected = day.id === selectedDayId;
        return (
          <Pressable
            key={day.id}
            onPress={() => onSelectDay(day.id)}
            style={[styles.dayPill, isSelected ? styles.dayPillSelected : styles.dayPillDefault]}
          >
            <Text style={[styles.weekday, isSelected && styles.weekdaySelected]}>
              {day.weekdayShort}
            </Text>
            <Text style={[styles.dayNumber, isSelected && styles.dayNumberSelected]}>
              {day.dayNumber}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.lg,
  },
  dayPill: {
    width: 56,
    paddingVertical: spacing.md,
    borderRadius: radii.full,
    alignItems: 'center',
    gap: 2,
  },
  dayPillDefault: {
    backgroundColor: colors.surfaceContainer,
    opacity: 0.72,
  },
  dayPillSelected: {
    backgroundColor: colors.primaryContainer,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  weekday: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  weekdaySelected: {
    color: colors.white,
  },
  dayNumber: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  dayNumberSelected: {
    color: colors.white,
  },
});
