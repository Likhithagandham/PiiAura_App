import { View, Text, StyleSheet } from 'react-native';
import { Wallet } from 'lucide-react-native';
import type { StudentFeesBalanceDetail } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface StudentFeesBalanceDetailsProps {
  title: string;
  detail: StudentFeesBalanceDetail;
}

export function StudentFeesBalanceDetails({ title, detail }: StudentFeesBalanceDetailsProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Wallet size={22} color={colors.textMuted} />
      </View>
      <View style={styles.row}>
        <Text style={styles.rowLabel}>{detail.paidAmountLabel}</Text>
        <Text style={styles.rowValuePrimary}>{detail.paidAmount}</Text>
      </View>
      <View style={[styles.row, styles.rowHighlight]}>
        <Text style={styles.rowLabel}>{detail.nextInstallmentLabel}</Text>
        <Text style={styles.rowValueAccent}>{detail.nextInstallmentDate}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.xl,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(191,201,196,0.5)',
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  rowHighlight: {
    backgroundColor: 'rgba(243,244,245,0.5)',
  },
  rowLabel: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  rowValuePrimary: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  rowValueAccent: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: '#482400',
  },
});
