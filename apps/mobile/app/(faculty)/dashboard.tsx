import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import {
  AlertTriangle,
  SquareCheck,
  Megaphone,
  Users,
  CheckCircle2,
} from 'lucide-react-native';
import {
  AlertBanner,
  SectionCard,
  HolidayRow,
  ProgressBar,
  colors,
  spacing,
  typography,
  radii,
} from '@piiaura/ui';
import { ROUTES, WALKTHROUGH_TARGETS } from '@piiaura/constants';
import { useAuth, useFacultyDashboard } from '@piiaura/hooks';
import { CircularProgressRing } from '@/components/faculty/CircularProgressRing';
import { EmptyScheduleState } from '@/components/faculty/EmptyScheduleState';
import { PriorityAlertsCard } from '@/components/faculty/PriorityAlertsCard';
import { WalkthroughTarget, useWalkthroughScrollRef } from '@/components/walkthrough/WalkthroughProvider';

function GlassCard({ children, style }: { children: React.ReactNode; style?: object }) {
  return <View style={[styles.glassCard, style]}>{children}</View>;
}

export default function FacultyDashboardScreen() {
  const { user } = useAuth();
  const { data, isLoading } = useFacultyDashboard();
  const scrollRef = useWalkthroughScrollRef();
  const dashboard = data?.data;

  if (isLoading || !dashboard) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  const {
    attendanceSummary,
    pendingLeave,
    liveAttendancePercent,
    pendingTasks,
    holidays,
    teachingProgress,
    alert,
  } = dashboard;

  return (
    <View style={styles.screen}>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <WalkthroughTarget id={WALKTHROUGH_TARGETS.FACULTY.DASHBOARD_GREETING} style={styles.greeting}>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.welcome}>Welcome back, {user?.name ?? 'Faculty'}</Text>
        </WalkthroughTarget>

        {alert ? (
          <AlertBanner
            message={alert.message}
            count={alert.count}
            actionLabel={alert.actionLabel}
            icon={<AlertTriangle size={18} color={colors.warningIcon} fill={colors.warningIcon} />}
          />
        ) : null}

        <WalkthroughTarget id={WALKTHROUGH_TARGETS.FACULTY.DASHBOARD_STATS}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.bentoRow}
            style={styles.bentoScroll}
          >
          <GlassCard style={styles.bentoCard}>
            <Text style={styles.bentoLabel}>ATTENDANCE</Text>
            <View style={styles.bentoValueRow}>
              <Text style={styles.bentoValuePrimary}>{attendanceSummary.markedPercentage}%</Text>
              <Text style={styles.bentoValueMeta}>
                {attendanceSummary.sessionsCompleted}/{attendanceSummary.sessionsTotal}
              </Text>
            </View>
          </GlassCard>

          <GlassCard style={styles.bentoCard}>
            <Text style={styles.bentoLabel}>PENDING LEAVE</Text>
            <View style={styles.bentoValueRow}>
              <Text style={styles.bentoValue}>{pendingLeave}</Text>
              <Text style={styles.bentoAwaiting}>AWAITING</Text>
            </View>
          </GlassCard>

          <GlassCard style={styles.bentoCard}>
            <Text style={styles.bentoLabel}>SESSIONS</Text>
            <View style={styles.bentoValueRow}>
              <Text style={styles.bentoValue}>
                {attendanceSummary.sessionsCompleted}/{attendanceSummary.sessionsTotal}
              </Text>
              <Text style={styles.bentoValueMeta}>TODAY</Text>
            </View>
          </GlassCard>
          </ScrollView>
        </WalkthroughTarget>

        <WalkthroughTarget id={WALKTHROUGH_TARGETS.FACULTY.DASHBOARD_QUICK_ACTIONS} style={styles.actionsRow}>
          <Pressable
            style={[styles.quickAction, styles.quickActionPrimary]}
            onPress={() => router.push(ROUTES.FACULTY.ATTENDANCE)}
          >
            <SquareCheck size={16} color={colors.white} />
            <Text style={styles.quickActionTextPrimary}>Mark Attendance</Text>
          </Pressable>
          <Pressable
            style={[styles.quickAction, styles.quickActionSecondary]}
            onPress={() => router.push(ROUTES.FACULTY.ANNOUNCEMENTS)}
          >
            <Megaphone size={16} color={colors.primary} />
            <Text style={styles.quickActionTextSecondary}>Announcements</Text>
          </Pressable>
        </WalkthroughTarget>

        <SectionCard
          title="Live attendance"
          action={
            <View style={styles.liveStatus}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>My classes</Text>
            </View>
          }
        >
          <View style={styles.liveCompact}>
            <View style={styles.liveRing}>
              <CircularProgressRing
                percent={liveAttendancePercent}
                label=""
                size={72}
                strokeWidth={6}
              />
            </View>
            <Text style={styles.liveDescription}>
              {liveAttendancePercent}% of students present in current session
            </Text>
          </View>
        </SectionCard>

        <WalkthroughTarget id={WALKTHROUGH_TARGETS.FACULTY.DASHBOARD_ALERTS}>
          <PriorityAlertsCard tasks={pendingTasks} />
        </WalkthroughTarget>

        <SectionCard
          title="Holiday calendar"
          subtitle="Attendance cannot be marked on declared institution holidays."
        >
          {holidays.map((holiday) => (
            <HolidayRow
              key={holiday.id}
              month={holiday.month}
              day={holiday.day}
              name={holiday.name}
              scope={holiday.scope}
              variant={holiday.variant}
            />
          ))}
        </SectionCard>

        <View style={styles.teachingCard}>
          <View style={styles.teachingLeft}>
            <Text style={styles.teachingLabel}>TEACHING PROGRESS</Text>
            <Text style={styles.teachingValue}>{teachingProgress}%</Text>
          </View>
          <View style={styles.teachingBar}>
            <ProgressBar
              label=""
              current={teachingProgress}
              total={100}
              trackColor="rgba(255,255,255,0.2)"
              fillColor={colors.white}
            />
          </View>
          <CheckCircle2 size={26} color="rgba(255,255,255,0.45)" />
        </View>

        <SectionCard
          title="Today's schedule"
          action={
            <Pressable onPress={() => router.push(ROUTES.FACULTY.ATTENDANCE)}>
              <Text style={styles.scheduleAction}>Mark attendance</Text>
            </Pressable>
          }
        >
          <EmptyScheduleState />
        </SectionCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  glassCard: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  loading: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: spacing['3xl'],
    color: colors.textSecondary,
  },
  greeting: {
    gap: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  welcome: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  bentoRow: {
    paddingHorizontal: 0,
    paddingBottom: spacing.sm,
    gap: spacing.md,
  },
  bentoScroll: {
    marginHorizontal: 0,
  },
  bentoCard: {
    width: 160,
  },
  bentoLabel: {
    fontSize: 10,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    letterSpacing: 1,
  },
  bentoValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  bentoValuePrimary: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  bentoValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  bentoValueMeta: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: typography.fontWeight.semibold,
  },
  bentoAwaiting: {
    fontSize: 10,
    color: colors.warningText,
    fontWeight: typography.fontWeight.bold,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  quickAction: {
    flex: 1,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  quickActionPrimary: {
    backgroundColor: colors.primary,
  },
  quickActionSecondary: {
    backgroundColor: colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  quickActionTextPrimary: {
    color: colors.white,
    fontWeight: typography.fontWeight.bold,
    fontSize: 12,
  },
  quickActionTextSecondary: {
    color: colors.text,
    fontWeight: typography.fontWeight.bold,
    fontSize: 12,
  },
  liveStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexShrink: 1,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  liveText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    flexShrink: 1,
  },
  liveCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  liveRing: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveDescription: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  scheduleAction: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  teachingCard: {
    backgroundColor: colors.primaryContainer,
    borderRadius: radii.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  teachingLeft: {
    gap: spacing.xs,
  },
  teachingLabel: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 1,
  },
  teachingValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  teachingBar: {
    flex: 1,
  },
});
