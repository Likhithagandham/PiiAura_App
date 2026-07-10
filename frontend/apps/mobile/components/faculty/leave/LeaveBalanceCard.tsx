import { StyleSheet, Text, View } from 'react-native';
import { CalendarDays, Stethoscope } from 'lucide-react-native';
import type { FacultyLeaveBalance } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';

const ICONS = {
  calendar: CalendarDays,
  medical: Stethoscope,
} as const;

interface LeaveBalanceCardProps {
  balance: FacultyLeaveBalance;
}

export function LeaveBalanceCard({ balance }: LeaveBalanceCardProps) {
  const Icon = ICONS[balance.icon];
  const remaining = balance.total - balance.used;
  const progress = balance.total > 0 ? remaining / balance.total : 0;

  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <Text style={styles.label}>{balance.label.toUpperCase()}</Text>
        <Text style={styles.value}>
          {String(remaining).padStart(2, '0')}{' '}
          <Text style={styles.total}>/ {balance.total}</Text>
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.min(progress * 100, 100)}%` }]} />
      </View>
      <View style={styles.decorIcon}>
        <Icon size={72} color={colors.primary} strokeWidth={1.5} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '47%',
    height: 128,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.xl,
    padding: spacing.lg,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  content: {
    zIndex: 1,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    letterSpacing: 0.8,
  },
  value: {
    marginTop: spacing.xs,
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  total: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    color: colors.textSecondary,
  },
  track: {
    height: 6,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceContainerHigh,
    overflow: 'hidden',
    zIndex: 1,
  },
  fill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radii.full,
  },
  decorIcon: {
    position: 'absolute',
    right: -8,
    bottom: -8,
    opacity: 0.1,
  },
});
