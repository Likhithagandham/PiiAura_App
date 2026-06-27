import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import type { StudentExamScheduleItem } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface StudentExamsScheduleListProps {
  exams: StudentExamScheduleItem[];
  onExamPress?: (exam: StudentExamScheduleItem) => void;
}

export function StudentExamsScheduleList({ exams, onExamPress }: StudentExamsScheduleListProps) {
  return (
    <View style={styles.list}>
      {exams.map((exam) => (
        <Pressable
          key={exam.id}
          style={[styles.row, exam.dimmed && styles.rowDimmed]}
          onPress={() => onExamPress?.(exam)}
          accessibilityRole="button"
          accessibilityLabel={`${exam.subject}, ${exam.detailsLabel}`}
        >
          <View style={styles.dateBadge}>
            <Text style={styles.month}>{exam.monthShort}</Text>
            <Text style={styles.day}>{exam.dayNumber}</Text>
          </View>
          <View style={styles.details}>
            <Text style={styles.subject}>{exam.subject}</Text>
            <Text style={styles.meta}>{exam.detailsLabel}</Text>
          </View>
          <ChevronRight size={20} color={colors.textMuted} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.xl,
    padding: spacing.lg,
  },
  rowDimmed: {
    opacity: 0.6,
  },
  dateBadge: {
    width: 48,
    height: 48,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  month: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    textTransform: 'uppercase',
  },
  day: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    lineHeight: typography.fontSize.lg,
  },
  details: {
    flex: 1,
    gap: 2,
  },
  subject: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  meta: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
});
