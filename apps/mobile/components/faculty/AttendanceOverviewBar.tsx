import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import type { FacultyAttendanceOverview } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface AttendanceOverviewBarProps {
  overview: FacultyAttendanceOverview;
}

function CircularProgress({ percent, size = 32 }: { percent: number; size?: number }) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E1E3E4"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.primaryContainer}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <Text style={styles.ringText}>{percent}%</Text>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

function StatColumn({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string | number;
  valueColor?: string;
}) {
  return (
    <View style={styles.statCol}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, valueColor ? { color: valueColor } : undefined]}>{value}</Text>
    </View>
  );
}

export function AttendanceOverviewBar({ overview }: AttendanceOverviewBarProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Attendance Overview — {overview.monthLabel}</Text>
      <View style={styles.card}>
        <StatColumn label="Present" value={overview.presentDays} valueColor={colors.primary} />
        <Divider />
        <StatColumn label="Absent" value={overview.absentDays} valueColor={colors.error} />
        <Divider />
        <StatColumn label="Leave" value={overview.leaveDays} />
        <Divider />
        <View style={styles.totalCol}>
          <View style={styles.totalText}>
            <Text style={styles.statLabel}>Total</Text>
            <Text style={[styles.statValue, styles.totalValue]}>{overview.attendancePercent}%</Text>
          </View>
          <CircularProgress percent={overview.attendancePercent} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(225,227,228,0.5)',
    borderRadius: radii.xl,
    padding: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  statValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: '800',
    color: colors.text,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(191,201,196,0.3)',
  },
  totalCol: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.md,
  },
  totalText: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  totalValue: {
    color: colors.primary,
  },
  ringText: {
    fontSize: 8,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
});
