import { View, Text, StyleSheet } from 'react-native';
import type { StudentTimetableDailySlot } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';
import { StudentTimetableDailySlotRow } from '@/components/student/timetable/StudentTimetableDailySlotRow';

interface StudentTimetableDailyViewProps {
  slots: StudentTimetableDailySlot[];
  showNowIndicator: boolean;
  nowIndicatorLabel: string;
}

export function StudentTimetableDailyView({
  slots,
  showNowIndicator,
  nowIndicatorLabel,
}: StudentTimetableDailyViewProps) {
  const hasActiveSlot = slots.some((slot) => slot.isActive);

  return (
    <View style={styles.container}>
      {showNowIndicator && hasActiveSlot ? (
        <View style={styles.nowBanner}>
          <View style={styles.nowDot} />
          <Text style={styles.nowLabel}>{nowIndicatorLabel}</Text>
        </View>
      ) : null}

      <View style={styles.slots}>
        {slots.map((slot) => (
          <StudentTimetableDailySlotRow key={slot.id} slot={slot} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  nowBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(0,77,64,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0,52,43,0.1)',
    borderRadius: radii.lg,
  },
  nowDot: {
    width: 8,
    height: 8,
    borderRadius: radii.full,
    backgroundColor: colors.primaryContainer,
  },
  nowLabel: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.primaryContainer,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  slots: {
    gap: spacing.xl,
  },
});
