import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useStudentFees } from '@piiaura/hooks';
import { colors, spacing, typography } from '@piiaura/ui';
import { StudentFeesHeroBanner } from '@/components/student/fees/StudentFeesHeroBanner';
import { StudentFeesBalanceBento } from '@/components/student/fees/StudentFeesBalanceBento';
import { StudentFeesBalanceDetails } from '@/components/student/fees/StudentFeesBalanceDetails';
import { StudentFeesQuickPayCard } from '@/components/student/fees/StudentFeesQuickPayCard';
import { StudentFeesPaymentHistory } from '@/components/student/fees/StudentFeesPaymentHistory';
import { StudentFeesSupportBanner } from '@/components/student/fees/StudentFeesSupportBanner';
import { useToast } from '@/components/toast/ToastProvider';

export default function StudentFeesScreen() {
  const { data, isLoading } = useStudentFees();
  const toast = useToast();
  const [paymentAmount, setPaymentAmount] = useState('');

  if (isLoading || !data) {
    return (
      <View style={styles.screen}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading fees...</Text>
        </View>
      </View>
    );
  }

  const amount = paymentAmount || String(data.quickPay.defaultAmount);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <StudentFeesHeroBanner banner={data.banner} />
        <StudentFeesBalanceBento summary={data.balanceSummary} />
        <StudentFeesBalanceDetails title={data.balanceDetailsTitle} detail={data.balanceDetail} />
        <StudentFeesQuickPayCard
          quickPay={data.quickPay}
          amount={amount}
          onAmountChange={setPaymentAmount}
          onPay={() => toast.show('Razorpay payment coming soon', 'info')}
        />
        <StudentFeesPaymentHistory
          title={data.paymentHistoryTitle}
          viewAllLabel={data.viewAllLabel}
          transactions={data.transactions}
          onViewAll={() => toast.show('Full payment history coming soon', 'info')}
          onDownloadReceipt={() => toast.show('Receipt download coming soon', 'info')}
        />
        <StudentFeesSupportBanner
          support={data.support}
          onContact={() => toast.show('Payment support coming soon', 'info')}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing['4xl'],
    gap: spacing.lg,
  },
});
