import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { FacultyStudentLeavePending } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface StudentLeavePendingCardProps {
  request: FacultyStudentLeavePending;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function StudentLeavePendingCard({
  request,
  onApprove,
  onReject,
}: StudentLeavePendingCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.name}>{request.studentName}</Text>
          <Text style={styles.classLabel}>{request.classLabel}</Text>
        </View>
        <View style={styles.dateBadge}>
          <Text style={styles.dateText}>{request.dateLabel}</Text>
        </View>
      </View>

      <Text style={styles.reason}>
        <Text style={styles.reasonLabel}>Reason: </Text>
        {request.reason}
      </Text>
      <Text style={styles.appliedBy}>Applied by: {request.appliedBy}</Text>

      <View style={styles.actions}>
        <Pressable style={styles.approveBtn} onPress={() => onApprove(request.id)}>
          <Text style={styles.approveText}>Approve</Text>
        </Pressable>
        <Pressable style={styles.rejectBtn} onPress={() => onReject(request.id)}>
          <Text style={styles.rejectText}>Reject</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  name: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  classLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  dateBadge: {
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  dateText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: '#7EBDAC',
  },
  reason: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  reasonLabel: {
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
  },
  appliedBy: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  approveBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    alignItems: 'center',
  },
  approveText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  rejectBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    alignItems: 'center',
  },
  rejectText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
});
