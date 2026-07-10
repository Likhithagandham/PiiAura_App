import { StyleSheet, Text, View } from 'react-native';
import type { FacultyStudentLeaveDecision } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface StudentLeaveDecisionCardProps {
  decision: FacultyStudentLeaveDecision;
}

export function StudentLeaveDecisionCard({ decision }: StudentLeaveDecisionCardProps) {
  const isApproved = decision.status === 'approved';

  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <Text style={styles.name}>{decision.studentName}</Text>
        <Text style={styles.reviewedBy}>Reviewed by {decision.reviewedBy}</Text>
      </View>
      <View style={styles.right}>
        <View style={[styles.badge, isApproved ? styles.badgeApproved : styles.badgeRejected]}>
          <View style={[styles.dot, { backgroundColor: isApproved ? '#16A34A' : colors.error }]} />
          <Text style={[styles.badgeText, { color: isApproved ? '#166534' : colors.error }]}>
            {decision.status}
          </Text>
        </View>
        <Text style={styles.timestamp}>{decision.timestampLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  left: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  reviewedBy: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  right: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  badgeApproved: {
    backgroundColor: '#DCFCE7',
  },
  badgeRejected: {
    backgroundColor: '#FEE2E2',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  timestamp: {
    fontSize: 10,
    color: colors.textSecondary,
  },
});
