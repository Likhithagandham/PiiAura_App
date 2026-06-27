import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Calendar, Megaphone } from 'lucide-react-native';
import { ROUTES } from '@piiaura/constants';
import { useStudentDashboard } from '@piiaura/hooks';
import { colors, spacing, typography } from '@piiaura/ui';
import { StudentFeeAlertCard } from '@/components/student/dashboard/StudentFeeAlertCard';
import { StudentStatsGrid } from '@/components/student/dashboard/StudentStatsGrid';
import {
  StudentDashboardEmptyCard,
  StudentUpcomingExamsSection,
} from '@/components/student/dashboard/StudentDashboardSections';
import { useToast } from '@/components/toast/ToastProvider';

export default function StudentDashboardScreen() {
  const { data, isLoading } = useStudentDashboard();
  const toast = useToast();

  if (isLoading || !data) {
    return (
      <View style={styles.screen}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading dashboard...</Text>
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
        <View style={styles.welcome}>
          <Text style={styles.welcomeTitle}>Welcome, {data.welcomeName}</Text>
          <Text style={styles.welcomeSubtitle}>{data.portalLabel}</Text>
        </View>

        <StudentFeeAlertCard
          alert={data.feeAlert}
          onPayNow={() => toast.show('Fee payment coming soon', 'info')}
          onViewDetails={() => toast.show('Fee details coming soon', 'info')}
        />

        <StudentStatsGrid
          attendance={data.attendance}
          hallTicket={data.hallTicket}
          assignments={data.assignments}
          onAssignmentsPress={() => router.push(ROUTES.STUDENT.ASSIGNMENTS as never)}
        />

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
