import { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useFacultyLeave } from '@piiaura/hooks';
import type { FacultyStudentLeavePending } from '@piiaura/types';
import { colors, spacing, typography } from '@piiaura/ui';
import { LeaveBalanceCard } from '@/components/faculty/leave/LeaveBalanceCard';
import { LeaveRequestForm } from '@/components/faculty/leave/LeaveRequestForm';
import { LeaveRequestCard } from '@/components/faculty/leave/LeaveRequestCard';
import {
  LeaveSectionTabs,
  type LeaveTabKey,
} from '@/components/faculty/leave/LeaveSectionTabs';
import { StudentLeavePendingCard } from '@/components/faculty/leave/StudentLeavePendingCard';
import { StudentLeaveDecisionCard } from '@/components/faculty/leave/StudentLeaveDecisionCard';
import { useToast } from '@/components/toast/ToastProvider';
import { useModuleWalkthrough } from '@/components/walkthrough/WalkthroughProvider';

export default function FacultyLeaveScreen() {
  useModuleWalkthrough('leave');
  const { data, isLoading, refetch, isFetching } = useFacultyLeave();
  const toast = useToast();
  const [tab, setTab] = useState<LeaveTabKey>('my');
  const [pendingRequests, setPendingRequests] = useState<FacultyStudentLeavePending[]>([]);

  useEffect(() => {
    if (data) {
      setPendingRequests(data.studentLeave.pendingRequests);
    }
  }, [data]);

  const pendingCount = pendingRequests.length;

  const handleSubmit = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    toast.show('Leave request submitted successfully', 'success');
  };

  const handleApprove = useCallback(
    (id: string) => {
      const request = pendingRequests.find((r) => r.id === id);
      setPendingRequests((prev) => prev.filter((r) => r.id !== id));
      toast.show(`${request?.studentName ?? 'Student'} leave approved`, 'success');
    },
    [pendingRequests, toast],
  );

  const handleReject = useCallback(
    (id: string) => {
      const request = pendingRequests.find((r) => r.id === id);
      setPendingRequests((prev) => prev.filter((r) => r.id !== id));
      toast.show(`${request?.studentName ?? 'Student'} leave rejected`, 'danger');
    },
    [pendingRequests, toast],
  );

  const handleRefresh = useCallback(() => {
    refetch().then(() => {
      if (data) {
        setPendingRequests(data.studentLeave.pendingRequests);
      }
      toast.show('Leave requests refreshed', 'info');
    });
  }, [data, refetch, toast]);

  if (isLoading || !data) {
    return (
      <View style={styles.screen}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading leave data...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <Text style={styles.title}>{data.title}</Text>
          <Text style={styles.description}>{data.description}</Text>
          <LeaveSectionTabs
            active={tab}
            onChange={setTab}
            onRefresh={handleRefresh}
            refreshing={isFetching}
          />
        </View>

        {tab === 'my' ? (
          <>
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
          </>
        ) : (
          <>
            <View style={styles.studentSection}>
              <Text style={styles.sectionTitle}>Pending ({pendingCount})</Text>
              <Text style={styles.sectionDescription}>
                {data.studentLeave.pendingDescription}
              </Text>
            </View>

            <View style={styles.requestsList}>
              {pendingRequests.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No pending student leave requests.</Text>
                </View>
              ) : (
                pendingRequests.map((request) => (
                  <StudentLeavePendingCard
                    key={request.id}
                    request={request}
                    onApprove={handleApprove}
                    onReject={handleReject}
                  />
                ))
              )}
            </View>

            <View style={styles.requestsSection}>
              <View style={styles.requestsHeader}>
                <Text style={styles.requestsTitle}>Recent decisions</Text>
                <Pressable>
                  <Text style={styles.viewAll}>View All</Text>
                </Pressable>
              </View>
              <View style={styles.requestsList}>
                {data.studentLeave.recentDecisions.map((decision) => (
                  <StudentLeaveDecisionCard key={decision.id} decision={decision} />
                ))}
              </View>
            </View>
          </>
        )}
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
  studentSection: {
    gap: spacing.xs,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  sectionDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
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
    gap: spacing.lg,
  },
  emptyState: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 12,
    padding: spacing['2xl'],
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
