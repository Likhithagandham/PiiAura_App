import { View, Text, StyleSheet } from 'react-native';
import { ClipboardList } from 'lucide-react-native';
import type { FacultyAttendanceSummary } from '@piiaura/types';
import { StatCard, ProgressBar, colors, spacing, typography, radii } from '@piiaura/ui';

interface AttendanceSummaryCardProps {
  summary: FacultyAttendanceSummary;
}

export function AttendanceSummaryCard({ summary }: AttendanceSummaryCardProps) {
  return (
    <View style={styles.container}>
      <StatCard
        label="ATTENDANCE MARKED"
        value={`${summary.markedPercentage}%`}
        icon={
          <View style={styles.iconBox}>
            <ClipboardList size={18} color={colors.infoIcon} />
          </View>
        }
        footer={
          <View style={styles.footer}>
            <Text style={styles.sessions}>
              {summary.sessionsCompleted} / {summary.sessionsTotal} sessions today
            </Text>
            <ProgressBar
              label="Sessions done"
              current={summary.sessionsCompleted}
              total={summary.sessionsTotal}
              fillColor={colors.primary}
            />
          </View>
        }
        style={styles.statCard}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  statCard: {
    flex: undefined,
    width: '100%',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    backgroundColor: colors.infoBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    gap: spacing.md,
  },
  sessions: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
});
