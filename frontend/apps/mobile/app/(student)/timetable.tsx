import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useStudentTimetable } from '@piiaura/hooks';
import { colors, spacing, typography } from '@piiaura/ui';
import { StudentTimetableViewTabs, type TimetableViewTab } from '@/components/student/timetable/StudentTimetableViewTabs';
import { StudentTimetableDaySelector } from '@/components/student/timetable/StudentTimetableDaySelector';
import { StudentTimetableDailyView } from '@/components/student/timetable/StudentTimetableDailyView';
import { StudentTimetableWeeklyGrid } from '@/components/student/timetable/StudentTimetableWeeklyGrid';
import { useModuleWalkthrough } from '@/components/walkthrough/WalkthroughProvider';

export default function StudentTimetableScreen() {
  useModuleWalkthrough('timetable');
  const { data, isLoading } = useStudentTimetable();
  const [viewTab, setViewTab] = useState<TimetableViewTab>('daily');
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);

  const activeDayId = selectedDayId ?? data?.selectedDayId ?? '';
  const dailySlots = useMemo(() => {
    if (!data?.dailySlotsByDay) return [];
    return data.dailySlotsByDay[activeDayId] ?? [];
  }, [data, activeDayId]);

  if (isLoading || !data) {
    return (
      <View style={styles.screen}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading timetable...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
      >
        <View style={styles.stickyHeader}>
          <StudentTimetableViewTabs active={viewTab} onChange={setViewTab} />
          {viewTab === 'daily' ? (
            <StudentTimetableDaySelector
              days={data.days}
              selectedDayId={activeDayId}
              onSelectDay={setSelectedDayId}
            />
          ) : null}
        </View>

        <View style={styles.body}>
          {viewTab === 'daily' ? (
            <StudentTimetableDailyView
              slots={dailySlots}
              showNowIndicator={data.showNowIndicator}
              nowIndicatorLabel={data.nowIndicatorLabel}
            />
          ) : (
            <StudentTimetableWeeklyGrid
              dayHeaders={data.weeklyDayHeaders}
              rows={data.weeklyRows}
              legendTitle={data.legendTitle}
              legend={data.legend}
            />
          )}
        </View>
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
    paddingBottom: spacing['4xl'],
  },
  stickyHeader: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  body: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
});
