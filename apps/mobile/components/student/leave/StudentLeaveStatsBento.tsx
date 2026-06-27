import { View, Text, StyleSheet } from 'react-native';
import { CalendarCheck, History } from 'lucide-react-native';
import type { StudentLeaveStats } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface StudentLeaveStatsBentoProps {
  stats: StudentLeaveStats;
}

export function StudentLeaveStatsBento({ stats }: StudentLeaveStatsBentoProps) {
  return (
    <View style={styles.grid}>
      <View style={styles.remainingCard}>
        <CalendarCheck size={24} color="#AFEFDD" />
        <View>
          <Text style={styles.remainingValue}>
            {String(stats.remainingCount).padStart(2, '0')}
          </Text>
          <Text style={styles.remainingLabel}>{stats.remainingLabel}</Text>
        </View>
      </View>

      <View style={styles.availedCard}>
        <History size={24} color="#516161" />
        <View>
          <Text style={styles.availedValue}>{String(stats.availedCount).padStart(2, '0')}</Text>
          <Text style={styles.availedLabel}>{stats.availedLabel}</Text>
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
  remainingCard: {
    flex: 1,
    height: 112,
    backgroundColor: colors.primaryContainer,
    borderRadius: radii.xl,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  availedCard: {
    flex: 1,
    height: 112,
    backgroundColor: colors.secondaryContainer,
    borderRadius: radii.xl,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  remainingValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  remainingLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.5,
  },
  availedValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: '#576867',
  },
  availedLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: 'rgba(87,104,103,0.7)',
    letterSpacing: 0.5,
  },
});
