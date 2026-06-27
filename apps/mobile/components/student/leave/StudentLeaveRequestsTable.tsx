import { View, Text, StyleSheet, Pressable } from 'react-native';
import type { StudentLeaveRequest, StudentLeaveRequestStatus } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface StudentLeaveRequestsTableProps {
  title: string;
  viewAllLabel: string;
  headers: {
    dates: string;
    typeReason: string;
    status: string;
  };
  requests: StudentLeaveRequest[];
  onViewAll: () => void;
}

function StatusPill({ status, label }: { status: StudentLeaveRequestStatus; label: string }) {
  const pillStyle =
    status === 'pending'
      ? styles.pillPending
      : status === 'approved'
        ? styles.pillApproved
        : styles.pillRejected;
  const textStyle =
    status === 'pending'
      ? styles.pillTextPending
      : status === 'approved'
        ? styles.pillTextApproved
        : styles.pillTextRejected;

  return (
    <View style={[styles.pill, pillStyle]}>
      <Text style={[styles.pillText, textStyle]}>{label}</Text>
    </View>
  );
}

export function StudentLeaveRequestsTable({
  title,
  viewAllLabel,
  headers,
  requests,
  onViewAll,
}: StudentLeaveRequestsTableProps) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Pressable onPress={onViewAll}>
          <Text style={styles.viewAll}>{viewAllLabel}</Text>
        </Pressable>
      </View>

      <View style={styles.table}>
        <View style={styles.tableHead}>
          <Text style={[styles.th, styles.colDates]}>{headers.dates}</Text>
          <Text style={[styles.th, styles.colType]}>{headers.typeReason}</Text>
          <Text style={[styles.th, styles.colStatus]}>{headers.status}</Text>
        </View>

        {requests.map((request, index) => (
          <View
            key={request.id}
            style={[styles.row, index < requests.length - 1 && styles.rowBorder]}
          >
            <View style={styles.colDates}>
              <Text style={styles.dateRange}>{request.dateRange}</Text>
              <Text style={styles.duration}>{request.durationLabel}</Text>
            </View>
            <View style={styles.colType}>
              <Text style={styles.leaveType}>{request.leaveType}</Text>
              <Text style={styles.reason} numberOfLines={1}>
                {request.reason}
              </Text>
            </View>
            <View style={styles.colStatus}>
              <StatusPill status={request.status} label={request.statusLabel} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  viewAll: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
    letterSpacing: 0.5,
  },
  table: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.xl,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  tableHead: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceContainer,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
    padding: spacing.md,
  },
  th: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    padding: spacing.md,
    alignItems: 'center',
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(191,201,196,0.3)',
  },
  colDates: {
    flex: 1.1,
  },
  colType: {
    flex: 1.2,
    paddingRight: spacing.sm,
  },
  colStatus: {
    flex: 0.9,
    alignItems: 'flex-end',
  },
  dateRange: {
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  duration: {
    fontSize: 10,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  leaveType: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    letterSpacing: 0.5,
  },
  reason: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  pill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  pillPending: {
    backgroundColor: 'rgba(255,151,44,0.1)',
  },
  pillApproved: {
    backgroundColor: 'rgba(148,211,193,0.3)',
  },
  pillRejected: {
    backgroundColor: '#FFDAD6',
  },
  pillText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  pillTextPending: {
    color: '#FF972C',
  },
  pillTextApproved: {
    color: '#065043',
  },
  pillTextRejected: {
    color: '#BA1A1A',
  },
});
