import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Redirect, router } from 'expo-router';
import { Calendar, Megaphone } from 'lucide-react-native';
import { ROUTES, WALKTHROUGH_TARGETS } from '@piiaura/constants';
import { useAuth, useStudentDashboard } from '@piiaura/hooks';
import { getConfiguredApiBaseUrl } from '@piiaura/api';
import { colors, spacing, typography } from '@piiaura/ui';
import { WalkthroughTarget, useWalkthroughScrollHandlers } from '@/components/walkthrough/WalkthroughProvider';
import { StudentFeeAlertCard } from '@/components/student/dashboard/StudentFeeAlertCard';
import { StudentStatsGrid } from '@/components/student/dashboard/StudentStatsGrid';
import {
  StudentDashboardEmptyCard,
  StudentUpcomingExamsSection,
} from '@/components/student/dashboard/StudentDashboardSections';
export default function StudentDashboardScreen() {
  const { hasHydrated, isAuthenticated } = useAuth();
  const { data, isFetching, isError, error, refetch } = useStudentDashboard();
  const scroll = useWalkthroughScrollHandlers();

  if (!hasHydrated) {
    return (
      <View style={styles.screen}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href={ROUTES.AUTH.LOGIN} />;
  }

  if (isFetching && !data) {
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
          <Text style={styles.errorHint}>API: {getConfiguredApiBaseUrl()}</Text>
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
        ref={scroll.ref}
        onScroll={scroll.onScroll}
        scrollEventThrottle={scroll.scrollEventThrottle}
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
              onPayNow={() => router.push(ROUTES.STUDENT.FEES as never)}
              onViewDetails={() => router.push(ROUTES.STUDENT.FEES as never)}
            />
          ) : null}
        </WalkthroughTarget>

        <WalkthroughTarget id={WALKTHROUGH_TARGETS.STUDENT.DASHBOARD_STATS}>
          <StudentStatsGrid
            attendance={data.attendance}
            hallTicket={data.hallTicket}
            assignments={data.assignments}
            onAttendancePress={() => router.push(ROUTES.STUDENT.ATTENDANCE as never)}
            onHallTicketPress={() => router.push(ROUTES.STUDENT.EXAMS as never)}
            onAssignmentsPress={() => router.push(ROUTES.STUDENT.NOTICES as never)}
          />
        </WalkthroughTarget>

        <WalkthroughTarget id={WALKTHROUGH_TARGETS.STUDENT.DASHBOARD_ACTIVITY}>
          <Pressable onPress={() => router.push(ROUTES.STUDENT.EXAMS as never)}>
            <StudentUpcomingExamsSection
              title={data.upcomingExamsTitle}
              count={data.upcomingExamsCount}
              exam={data.featuredExam}
              nextExamLabel={data.nextExamLabel}
            />
          </Pressable>

          <Pressable onPress={() => router.push(ROUTES.STUDENT.TIMETABLE as never)}>
            <StudentDashboardEmptyCard
              title={data.todayScheduleTitle}
              empty={data.todayScheduleEmpty}
              Icon={Calendar}
              dashed
            />
          </Pressable>

          <Pressable onPress={() => router.push(ROUTES.STUDENT.NOTICES as never)}>
            <StudentDashboardEmptyCard
              title={data.announcementsTitle}
              empty={data.announcementsEmpty}
              Icon={Megaphone}
            />
          </Pressable>
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
  errorHint: {
    marginTop: spacing.sm,
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
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
