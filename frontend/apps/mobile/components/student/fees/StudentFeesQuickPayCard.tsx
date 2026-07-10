import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';
import { CreditCard, Lock, ArrowRight } from 'lucide-react-native';
import type { StudentFeesQuickPay } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface StudentFeesQuickPayCardProps {
  quickPay: StudentFeesQuickPay;
  amount: string;
  onAmountChange: (value: string) => void;
  onPay: () => void;
}

export function StudentFeesQuickPayCard({
  quickPay,
  amount,
  onAmountChange,
  onPay,
}: StudentFeesQuickPayCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <CreditCard size={22} color={colors.primary} fill={colors.primary} />
        <Text style={styles.title}>{quickPay.title}</Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>{quickPay.amountLabel}</Text>
        <View style={styles.inputWrap}>
          <TextInput
            value={amount}
            onChangeText={onAmountChange}
            keyboardType="numeric"
            style={styles.input}
            placeholderTextColor={colors.textMuted}
          />
          <Text style={styles.currency}>{quickPay.currencyLabel}</Text>
        </View>
      </View>

      <Pressable style={styles.payBtn} onPress={onPay}>
        <Text style={styles.payBtnText}>{quickPay.payNowLabel}</Text>
        <ArrowRight size={20} color={colors.white} />
      </Pressable>

      <View style={styles.secureRow}>
        <Lock size={14} color={colors.textMuted} />
        <Text style={styles.secureLabel}>{quickPay.secureLabel}</Text>
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
    padding: spacing.lg,
    gap: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  inputWrap: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingRight: spacing['3xl'],
    fontSize: typography.fontSize.lg,
    color: colors.text,
  },
  currency: {
    position: 'absolute',
    right: spacing.lg,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.outlineVariant,
    letterSpacing: 0.5,
  },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: '#00342B',
    paddingVertical: spacing.lg,
    borderRadius: radii.xl,
  },
  payBtnText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    opacity: 0.6,
  },
  secureLabel: {
    fontSize: 10,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
});
