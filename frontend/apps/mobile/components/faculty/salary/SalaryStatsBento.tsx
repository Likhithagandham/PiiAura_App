import { StyleSheet, Text, View } from 'react-native';
import { Wallet, CalendarClock } from 'lucide-react-native';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface SalaryStatsBentoProps {
  netPayableLabel: string;
  netPayableValue: string;
  lastProcessedLabel: string;
  lastProcessedValue: string;
}

export function SalaryStatsBento({
  netPayableLabel,
  netPayableValue,
  lastProcessedLabel,
  lastProcessedValue,
}: SalaryStatsBentoProps) {
  return (
    <View style={styles.grid}>
      <View style={styles.primaryTile}>
        <Wallet size={24} color="#7EBDAC" />
        <View>
          <Text style={styles.primaryLabel}>{netPayableLabel}</Text>
          <Text style={styles.primaryValue}>{netPayableValue}</Text>
        </View>
      </View>
      <View style={styles.neutralTile}>
        <CalendarClock size={24} color={colors.primary} />
        <View>
          <Text style={styles.neutralLabel}>{lastProcessedLabel}</Text>
          <Text style={styles.neutralValue}>{lastProcessedValue}</Text>
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
  primaryTile: {
    flex: 1,
    height: 128,
    backgroundColor: colors.primaryContainer,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  primaryLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: 'rgba(126,189,172,0.8)',
  },
  primaryValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: '#7EBDAC',
  },
  neutralTile: {
    flex: 1,
    height: 128,
    backgroundColor: colors.surfaceContainer,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  neutralLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
  },
  neutralValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
});
