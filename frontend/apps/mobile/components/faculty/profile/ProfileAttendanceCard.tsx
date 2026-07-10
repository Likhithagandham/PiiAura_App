import { View, Text, StyleSheet } from 'react-native';
import { TrendingUp } from 'lucide-react-native';
import type { FacultyProfileAttendance } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface ProfileAttendanceCardProps {
  attendance: FacultyProfileAttendance;
}

export function ProfileAttendanceCard({ attendance }: ProfileAttendanceCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.label}>{attendance.label}</Text>
        <TrendingUp size={18} color="#7EBDAC" />
      </View>

      <View style={styles.valueRow}>
        <Text style={styles.percent}>{attendance.percent}%</Text>
        <Text style={styles.period}>{attendance.periodLabel}</Text>
      </View>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${attendance.percent}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primaryContainer,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: '#7EBDAC',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  percent: {
    fontSize: 32,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    lineHeight: 34,
  },
  period: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(126,189,172,0.8)',
  },
  track: {
    height: 8,
    borderRadius: radii.full,
    backgroundColor: 'rgba(126,189,172,0.2)',
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  fill: {
    height: '100%',
    borderRadius: radii.full,
    backgroundColor: colors.white,
  },
});
