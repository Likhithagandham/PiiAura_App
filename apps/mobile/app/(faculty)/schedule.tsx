import { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { SegmentTabs, type SegmentTabKey } from '@/components/faculty/SegmentTabs';
import { FacultyCalendarGrid } from '@/components/faculty/FacultyCalendarGrid';
import { WeeklyTimetableList } from '@/components/faculty/WeeklyTimetableList';
import { AttendanceOverviewBar } from '@/components/faculty/AttendanceOverviewBar';
import { WALKTHROUGH_TARGETS } from '@piiaura/constants';
import { useFacultySchedule } from '@piiaura/hooks';
import {
  ATTENDANCE_STATUS_LABELS,
  buildCalendarMonth,
  clampSelectedDateToMonth,
  computeAttendanceOverview,
  formatSelectedDayLabel,
  shiftMonth,
} from '@piiaura/mock-data';
import { AlertBanner, colors, spacing, typography, radii } from '@piiaura/ui';
import { useModuleWalkthrough } from '@/components/walkthrough/WalkthroughProvider';
import { WalkthroughTarget } from '@/components/walkthrough/WalkthroughProvider';

const STATUS_ACCENT: Record<string, string> = {
  present: '#2E7D32',
  absent: colors.error,
  leave: colors.error,
  holiday: '#2563EB',
  not_marked: '#FBC02D',
};

export default function FacultyScheduleScreen() {
  useModuleWalkthrough('schedule');
  const { data } = useFacultySchedule();
  const [tab, setTab] = useState<SegmentTabKey>('calendar');

  const anchor = data?.calendarAnchor ?? { year: 2026, month: 5 };
  const [viewYear, setViewYear] = useState(anchor.year);
  const [viewMonth, setViewMonth] = useState(anchor.month);
  const [selectedDate, setSelectedDate] = useState('2026-06-25');

  const defaultWeekIndex = data?.weekly.defaultWeekIndex ?? 0;
  const [weekIndex, setWeekIndex] = useState(defaultWeekIndex);

  const attendanceByDate = data?.attendanceByDate ?? {};
  const weeks = data?.weekly.weeks ?? [];
  const currentWeek = weeks[weekIndex];
  const canGoPrevWeek = weekIndex > 0;
  const canGoNextWeek = weekIndex < weeks.length - 1;

  const calendar = useMemo(
    () => buildCalendarMonth(viewYear, viewMonth, attendanceByDate, selectedDate),
    [viewYear, viewMonth, attendanceByDate, selectedDate],
  );

  const overview = useMemo(
    () => computeAttendanceOverview(viewYear, viewMonth, attendanceByDate),
    [viewYear, viewMonth, attendanceByDate],
  );

  const selectedDay = useMemo(
    () => calendar.days.find((day) => day.date === selectedDate),
    [calendar.days, selectedDate],
  );

  const goToMonth = useCallback(
    (delta: number) => {
      const next = shiftMonth(viewYear, viewMonth, delta);
      setViewYear(next.year);
      setViewMonth(next.month);
      setSelectedDate((current) => clampSelectedDateToMonth(current, next.year, next.month));
    },
    [viewYear, viewMonth],
  );

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <WalkthroughTarget id={WALKTHROUGH_TARGETS.FACULTY.SCHEDULE_ALERT}>
          <AlertBanner
            variant="leave"
            message="Students awaiting approval."
            count={data?.alertCount ?? 2}
            actionLabel="View details"
            icon={<AlertCircle size={20} color="#6D3A00" />}
          />
        </WalkthroughTarget>

        <WalkthroughTarget id={WALKTHROUGH_TARGETS.FACULTY.SCHEDULE_OVERVIEW}>
          <AttendanceOverviewBar overview={overview} />
        </WalkthroughTarget>

        <WalkthroughTarget id={WALKTHROUGH_TARGETS.FACULTY.SCHEDULE_TABS}>
          <SegmentTabs active={tab} onChange={setTab} />
        </WalkthroughTarget>

        {tab === 'calendar' ? (
          <WalkthroughTarget id={WALKTHROUGH_TARGETS.FACULTY.SCHEDULE_CALENDAR} style={styles.panel}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>{calendar.monthLabel}</Text>
              <View style={styles.monthNav}>
                <Pressable style={styles.circleBtn} onPress={() => goToMonth(-1)}>
                  <ChevronLeft size={14} color={colors.textSecondary} />
                </Pressable>
                <Pressable style={styles.circleBtn} onPress={() => goToMonth(1)}>
                  <ChevronRight size={14} color={colors.textSecondary} />
                </Pressable>
              </View>
            </View>

            <FacultyCalendarGrid
              daysOfWeek={calendar.daysOfWeek}
              days={calendar.days}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />

            {selectedDay ? (
              <View style={styles.detailCard}>
                <Text style={styles.detailDate}>{formatSelectedDayLabel(selectedDate)}</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>My attendance</Text>
                  <Text
                    style={[
                      styles.detailStatus,
                      { color: STATUS_ACCENT[selectedDay.status] ?? colors.text },
                    ]}
                  >
                    {ATTENDANCE_STATUS_LABELS[selectedDay.status]}
                  </Text>
                </View>
              </View>
            ) : null}

            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
                <Text style={styles.legendText}>Present</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.error }]} />
                <Text style={styles.legendText}>Absent</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.surfaceContainerHigh }]} />
                <Text style={styles.legendText}>Not Marked</Text>
              </View>
            </View>
          </WalkthroughTarget>
        ) : (
          <WalkthroughTarget id={WALKTHROUGH_TARGETS.FACULTY.SCHEDULE_CALENDAR} style={styles.weeklyWrap}>
            <View style={styles.weeklyHeader}>
              <View>
                <Text style={styles.weeklyTitle}>{data?.weekly.title ?? 'Teaching Schedule'}</Text>
                <Text style={styles.weeklySubtitle}>
                  Week {currentWeek?.weekNumber ?? 24}, {data?.weekly.semesterLabel ?? 'Academic Semester'}
                </Text>
              </View>
              <View style={styles.weeklyNav}>
                <Pressable
                  style={[styles.circleBtn, !canGoPrevWeek && styles.circleBtnDisabled]}
                  onPress={() => canGoPrevWeek && setWeekIndex((i) => i - 1)}
                  disabled={!canGoPrevWeek}
                >
                  <ChevronLeft size={20} color={canGoPrevWeek ? colors.textSecondary : colors.textMuted} />
                </Pressable>
                <Pressable
                  style={[styles.circleBtn, !canGoNextWeek && styles.circleBtnDisabled]}
                  onPress={() => canGoNextWeek && setWeekIndex((i) => i + 1)}
                  disabled={!canGoNextWeek}
                >
                  <ChevronRight size={20} color={canGoNextWeek ? colors.textSecondary : colors.textMuted} />
                </Pressable>
              </View>
            </View>

            <WeeklyTimetableList slots={currentWeek?.slots ?? []} />
          </WalkthroughTarget>
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
  content: {
    padding: spacing.lg,
    gap: spacing['2xl'],
    paddingBottom: spacing['4xl'],
  },
  panel: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(191,201,196,0.4)',
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  panelTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  monthNav: {
    flexDirection: 'row',
    gap: 6,
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  circleBtnDisabled: {
    opacity: 0.45,
  },
  detailCard: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  detailDate: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  detailStatus: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(191,201,196,0.3)',
    paddingTop: spacing.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  weeklyWrap: {
    gap: spacing.lg,
  },
  weeklyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weeklyTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  weeklySubtitle: {
    marginTop: 2,
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  weeklyNav: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
