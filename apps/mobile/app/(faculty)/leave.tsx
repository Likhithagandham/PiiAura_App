import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useFacultyLeave } from '@piiaura/hooks';
import { colors, spacing, typography } from '@piiaura/ui';
import { FacultyHeader } from '@/components/faculty/FacultyHeader';
import { LeaveBalanceCard } from '@/components/faculty/leave/LeaveBalanceCard';
import { LeaveRequestForm } from '@/components/faculty/leave/LeaveRequestForm';
import { LeaveRequestCard } from '@/components/faculty/leave/LeaveRequestCard';
import { useToast } from '@/components/toast/ToastProvider';

export default function FacultyLeaveScreen() {
  const { data, isLoading } = useFacultyLeave();
  const toast = useToast();

  const handleSubmit = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    toast.show('Leave request submitted successfully', 'success');
  };

  if (isLoading || !data) {
    return (
      <View style={styles.screen}>
        <FacultyHeader title="My Leave" showBack />
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading leave data...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <FacultyHeader title="My Leave" showBack />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <Text style={styles.title}>{data.title}</Text>
          <Text style={styles.description}>{data.description}</Text>
        </View>

        <View style={styles.balanceGrid}>
          {data.balances.map((balance) => (
            <LeaveBalanceCard key={balance.id} balance={balance} />
          ))}
        </View>

        <LeaveRequestForm leaveTypes={data.leaveTypes} onSubmit={handleSubmit} />

        <View style={styles.requestsSection}>
          <View style={styles.requestsHeader}>
            <Text style={styles.requestsTitle}>Recent Requests</Text>
            <Pressable>
              <Text style={styles.viewAll}>View All</Text>
            </Pressable>
          </View>
          <View style={styles.requestsList}>
            {data.recentRequests.map((request) => (
              <LeaveRequestCard key={request.id} request={request} />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
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
    gap: spacing['2xl'],
    paddingBottom: spacing['4xl'],
  },
  intro: {
    gap: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  balanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  requestsSection: {
    gap: spacing.sm,
  },
  requestsHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  requestsTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  viewAll: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  requestsList: {
    gap: spacing.sm,
  },
});
