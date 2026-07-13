import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Calendar, Megaphone } from 'lucide-react-native';
import { ROUTES, WALKTHROUGH_TARGETS } from '@piiaura/constants';
import { useStudentDashboard } from '@piiaura/hooks';
import { colors, spacing, typography } from '@piiaura/ui';
import { WalkthroughTarget, useWalkthroughScrollRef } from '@/components/walkthrough/WalkthroughProvider';
import { StudentFeeAlertCard } from '@/components/student/dashboard/StudentFeeAlertCard';
import { StudentStatsGrid } from '@/components/student/dashboard/StudentStatsGrid';
import {
  StudentDashboardEmptyCard,
  StudentUpcomingExamsSection,
} from '@/components/student/dashboard/StudentDashboardSections';
import { useToast } from '@/components/toast/ToastProvider';

export default function StudentDashboardScreen() {
  const { data, isLoading, isError, error, refetch } = useStudentDashboard();
  const toast = useToast();
  const scrollRef = useWalkthroughScrollRef();

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={styles.screen}>
        <View style={styles.loading}>
          <Text style={styles.errorTitle}>Could not load dashboard</Text>
          <Text style={styles.errorText}>
            {error instanceof Error
              ? error.message
              : 'Check that EduOS-backend is running and EXPO_PUBLIC_API_URL is reachable.'}
          </Text>
          <Pressable style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <WalkthroughTarget id={WALKTHROUGH_TARGETS.STUDENT.DASHBOARD_WELCOME} style={styles.welcome}>
          <Text style={styles.welcomeTitle}>Welcome, {data.welcomeName}</Text>
          <Text style={styles.welcomeSubtitle}>{data.portalLabel}</Text>
        </WalkthroughTarget>

        <WalkthroughTarget id={WALKTHROUGH_TARGETS.STUDENT.DASHBOARD_NOTIFICATIONS}>
          {data.feeAlert.amountLabel ? (
            <StudentFeeAlertCard
              alert={data.feeAlert}
              onPayNow={() => toast.show('Fee payment coming soon', 'info')}
              onViewDetails={() => toast.show('Fee details coming soon', 'info')}
            />
          ) : null}
        </WalkthroughTarget>

        <WalkthroughTarget id={WALKTHROUGH_TARGETS.STUDENT.DASHBOARD_STATS}>
          <StudentStatsGrid
            attendance={data.attendance}
            hallTicket={data.hallTicket}
            assignments={data.assignments}
            onAssignmentsPress={() => router.push(ROUTES.STUDENT.LEARN as never)}
          />
        </WalkthroughTarget>

        <WalkthroughTarget id={WALKTHROUGH_TARGETS.STUDENT.DASHBOARD_ACTIVITY}>
          <StudentUpcomingExamsSection
            title={data.upcomingExamsTitle}
            count={data.upcomingExamsCount}
            exam={data.featuredExam}
            nextExamLabel={data.nextExamLabel}
          />

          <StudentDashboardEmptyCard
            title={data.todayScheduleTitle}
            empty={data.todayScheduleEmpty}
            Icon={Calendar}
            dashed
          />

          <StudentDashboardEmptyCard
            title={data.announcementsTitle}
            empty={data.announcementsEmpty}
            Icon={Megaphone}
          />
        </WalkthroughTarget>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
  errorTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primaryContainer,
    marginBottom: spacing.sm,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  retryBtn: {
    marginTop: spacing.lg,
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 999,
  },
  retryText: {
    color: colors.surface,
    fontWeight: typography.fontWeight.semibold,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing['4xl'],
    gap: spacing['2xl'],
  },
  welcome: {
    gap: spacing.xs,
  },
  welcomeTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primaryContainer,
  },
  welcomeSubtitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
});
