import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { StudentTimetableDayOption } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface StudentTimetableDaySelectorProps {
  days: StudentTimetableDayOption[];
  selectedDayId: string;
  onSelectDay: (dayId: string) => void;
}

export function StudentTimetableDaySelector({
  days,
  selectedDayId,
  onSelectDay,
}: StudentTimetableDaySelectorProps) {
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
            style={[styles.dayPill, isSelected && styles.dayPillSelected]}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
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
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
  dayPill: {
    width: 48,
    height: 64,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  dayPillSelected: {
    backgroundColor: colors.primaryContainer,
    borderColor: 'rgba(0,52,43,0.2)',
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
    opacity: 0.7,
  },
  weekdaySelected: {
    color: colors.white,
    opacity: 0.85,
  },
  dayNumber: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
  },
  dayNumberSelected: {
    color: colors.white,
  },
});
