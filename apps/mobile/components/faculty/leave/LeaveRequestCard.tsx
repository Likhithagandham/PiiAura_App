import { StyleSheet, Text, View } from 'react-native';
import type { FacultyLeaveRequest, FacultyLeaveRequestStatus } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';

const STATUS_STYLES: Record<
  FacultyLeaveRequestStatus,
  { bg: string; text: string; dot: string }
> = {
  approved: { bg: '#DCFCE7', text: '#166534', dot: '#16A34A' },
  pending: { bg: '#FFEDD5', text: '#9A3412', dot: '#EA580C' },
  completed: { bg: '#F3F4F6', text: '#374151', dot: '#6B7280' },
  rejected: { bg: '#FEE2E2', text: '#991B1B', dot: '#DC2626' },
};

interface LeaveRequestCardProps {
  request: FacultyLeaveRequest;
}

export function LeaveRequestCard({ request }: LeaveRequestCardProps) {
  const statusStyle = STATUS_STYLES[request.status];

  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <Text style={styles.leaveType}>{request.leaveType}</Text>
        <Text style={styles.dateRange}>{request.dateRangeLabel}</Text>
      </View>
      <View style={styles.right}>
        <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
          <View style={[styles.badgeDot, { backgroundColor: statusStyle.dot }]} />
          <Text style={[styles.badgeText, { color: statusStyle.text }]}>
            {request.status}
          </Text>
        </View>
        <Text style={styles.meta}>{request.metaLabel}</Text>
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
  leaveType: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  dateRange: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  right: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  badgeDot: {
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
  meta: {
    fontSize: 10,
    color: colors.textSecondary,
  },
});
