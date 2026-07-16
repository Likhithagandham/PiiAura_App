import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Check, ChevronRight } from 'lucide-react-native';
import type { StudentDashboardStatTile } from '@piiaura/types';
import { CircularProgressRing } from '@/components/faculty/CircularProgressRing';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface StudentStatsGridProps {
  attendance: StudentDashboardStatTile;
  hallTicket: StudentDashboardStatTile;
  assignments: StudentDashboardStatTile;
  onAttendancePress?: () => void;
  onHallTicketPress?: () => void;
  onAssignmentsPress?: () => void;
}

export function StudentStatsGrid({
  attendance,
  hallTicket,
  assignments,
  onAttendancePress,
  onHallTicketPress,
  onAssignmentsPress,
}: StudentStatsGridProps) {
  return (
    <View style={styles.grid}>
      <Pressable
        style={styles.attendanceCard}
        onPress={onAttendancePress}
        accessibilityRole="button"
        accessibilityLabel={`${attendance.label}, ${attendance.badgeLabel}`}
      >
        <Text style={styles.tileLabel}>{attendance.label}</Text>
        <CircularProgressRing
          percent={attendance.percent ?? 0}
          label=""
          size={120}
          strokeWidth={8}
        />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{attendance.badgeLabel}</Text>
        </View>
      </Pressable>

      <View style={styles.rightColumn}>
        <Pressable
          style={styles.hallTicketCard}
          onPress={onHallTicketPress}
          accessibilityRole="button"
          accessibilityLabel={`${hallTicket.label}, ${hallTicket.status}`}
        >
          <Text style={styles.tileLabel}>{hallTicket.label}</Text>
          <View style={styles.readyRow}>
            <View style={styles.checkCircle}>
              <Check size={12} color={colors.white} strokeWidth={3} />
            </View>
            <Text style={styles.readyText}>{hallTicket.status}</Text>
          </View>
        </Pressable>

        <Pressable
          style={styles.assignmentsCard}
          onPress={onAssignmentsPress}
          accessibilityRole="button"
          accessibilityLabel={`${assignments.label}, ${assignments.countLabel}`}
        >
          <View>
            <Text style={styles.assignmentsLabel}>{assignments.label}</Text>
            <Text style={styles.assignmentsCount}>{assignments.countLabel}</Text>
          </View>
          <ChevronRight size={22} color={colors.white} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  attendanceCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radii.xl,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 180,
    gap: spacing.sm,
  },
  tileLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    alignSelf: 'flex-start',
  },
  badge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
  },
  badgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.primaryContainer,
  },
  rightColumn: {
    flex: 1,
    gap: spacing.md,
  },
  hallTicketCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radii.xl,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  readyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: radii.full,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readyText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primaryContainer,
  },
  assignmentsCard: {
    flex: 1,
    backgroundColor: colors.primaryContainer,
    borderRadius: radii.xl,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  assignmentsLabel: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: '#99F6E4',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  assignmentsCount: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginTop: 2,
  },
});
