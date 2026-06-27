import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Receipt, Download } from 'lucide-react-native';
import type { StudentFeeTransaction } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface StudentFeesPaymentHistoryProps {
  title: string;
  viewAllLabel: string;
  transactions: StudentFeeTransaction[];
  onViewAll: () => void;
  onDownloadReceipt: (transaction: StudentFeeTransaction) => void;
}

function StatusBadge({ status, label }: { status: StudentFeeTransaction['status']; label: string }) {
  const isSuccess = status === 'success';

  return (
    <View style={[styles.badge, isSuccess ? styles.badgeSuccess : styles.badgeCompleted]}>
      <Text style={[styles.badgeText, isSuccess ? styles.badgeTextSuccess : styles.badgeTextCompleted]}>
        {label}
      </Text>
    </View>
  );
}

export function StudentFeesPaymentHistory({
  title,
  viewAllLabel,
  transactions,
  onViewAll,
  onDownloadReceipt,
}: StudentFeesPaymentHistoryProps) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Pressable onPress={onViewAll}>
          <Text style={styles.viewAll}>{viewAllLabel}</Text>
        </Pressable>
      </View>

      <View style={styles.list}>
        {transactions.map((txn) => (
          <View key={txn.id} style={[styles.card, txn.dimmed && styles.cardDimmed]}>
            <View style={styles.left}>
              <View style={[styles.iconWrap, txn.dimmed ? styles.iconWrapMuted : styles.iconWrapActive]}>
                <Receipt size={20} color={txn.dimmed ? colors.textSecondary : '#576867'} />
              </View>
              <View style={styles.txnInfo}>
                <Text style={styles.date}>{txn.date}</Text>
                <View style={styles.metaRow}>
                  <StatusBadge status={txn.status} label={txn.statusLabel} />
                  <Text style={styles.txnId}>{txn.transactionId}</Text>
                </View>
              </View>
            </View>
            <View style={styles.right}>
              <Text style={styles.amount}>{txn.amount}</Text>
              <Pressable style={styles.receiptBtn} onPress={() => onDownloadReceipt(txn)}>
                <Download size={16} color={colors.primary} />
                <Text style={styles.receiptLabel}>Receipt</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  viewAll: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
    letterSpacing: 0.5,
  },
  list: {
    gap: spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardDimmed: {
    opacity: 0.7,
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: colors.secondaryContainer,
  },
  iconWrapMuted: {
    backgroundColor: colors.surfaceContainer,
  },
  txnInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  date: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  badgeSuccess: {
    backgroundColor: '#DCFCE7',
  },
  badgeCompleted: {
    backgroundColor: colors.surfaceContainerHigh,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    textTransform: 'uppercase',
  },
  badgeTextSuccess: {
    color: '#15803D',
  },
  badgeTextCompleted: {
    color: colors.textSecondary,
  },
  txnId: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  right: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  receiptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  receiptLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
    letterSpacing: 0.5,
  },
});
