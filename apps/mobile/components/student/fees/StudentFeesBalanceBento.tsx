import { View, Text, StyleSheet } from 'react-native';
import type { StudentFeesBalanceSummary } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';
import { CircularProgressRing } from '@/components/faculty/CircularProgressRing';

interface StudentFeesBalanceBentoProps {
  summary: StudentFeesBalanceSummary;
}

export function StudentFeesBalanceBento({ summary }: StudentFeesBalanceBentoProps) {
  return (
    <View style={styles.grid}>
      <View style={styles.progressCard}>
        <CircularProgressRing
          percent={summary.paidPercent}
          label=""
          sublabel={summary.paidLabel}
          size={96}
          strokeWidth={8}
        />
        <Text style={styles.progressLabel}>{summary.progressLabel}</Text>
      </View>

      <View style={styles.dueColumn}>
        <View style={styles.totalDueCard}>
          <Text style={styles.dueLabel}>{summary.totalDueLabel}</Text>
          <Text style={styles.dueAmountPrimary}>{summary.totalDueAmount}</Text>
        </View>
        <View style={styles.balanceDueCard}>
          <Text style={styles.balanceLabel}>{summary.balanceDueLabel}</Text>
          <Text style={styles.balanceAmount}>{summary.balanceDueAmount}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  progressCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.xl,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  progressLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  dueColumn: {
    flex: 1,
    gap: spacing.sm,
  },
  totalDueCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.xl,
    padding: spacing.sm,
    justifyContent: 'center',
  },
  balanceDueCard: {
    flex: 1,
    backgroundColor: colors.secondaryContainer,
    borderRadius: radii.xl,
    padding: spacing.sm,
    justifyContent: 'center',
  },
  dueLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  dueAmountPrimary: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
    marginTop: 2,
  },
  balanceLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: '#576867',
    letterSpacing: 0.5,
  },
  balanceAmount: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: '#3A4A49',
    marginTop: 2,
  },
});
