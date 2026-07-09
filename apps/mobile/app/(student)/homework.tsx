import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { useStudentHomework } from '@piiaura/hooks';
import { colors, spacing, typography } from '@piiaura/ui';
import { StudentHomeworkOverviewBento } from '@/components/student/homework/StudentHomeworkOverviewBento';
import { StudentHomeworkDayScroller } from '@/components/student/homework/StudentHomeworkDayScroller';
import { StudentHomeworkTimeline } from '@/components/student/homework/StudentHomeworkTimeline';
import { StudentHomeworkFab } from '@/components/student/homework/StudentHomeworkFab';
import { useToast } from '@/components/toast/ToastProvider';
import { useModuleWalkthrough } from '@/components/walkthrough/WalkthroughProvider';

export default function StudentHomeworkScreen() {
  useModuleWalkthrough('homework');
  const { data, isLoading } = useStudentHomework();
  const toast = useToast();
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);

  const activeDayId = selectedDayId ?? data?.selectedDayId ?? '';
  const entries = useMemo(() => {
    if (!data) return [];
    return data.entriesByDay[activeDayId] ?? [];
  }, [data, activeDayId]);

  if (isLoading || !data) {
    return (
      <View style={styles.screen}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading diary...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <StudentHomeworkOverviewBento overview={data.overview} />

        <View style={styles.diarySection}>
          <View style={styles.diaryHeader}>
            <Text style={styles.diaryTitle}>{data.diarySectionTitle}</Text>
            <Pressable style={styles.monthBtn} onPress={() => toast.show('Month picker coming soon', 'info')}>
              <Text style={styles.monthLabel}>{data.monthLabel}</Text>
              <ChevronDown size={16} color={colors.primaryContainer} />
            </Pressable>
          </View>

          <StudentHomeworkDayScroller
            days={data.days}
            selectedDayId={activeDayId}
            onSelectDay={setSelectedDayId}
          />

          <StudentHomeworkTimeline
            entries={entries}
            onSubmit={() => toast.show('Submit work coming soon', 'info')}
            onViewDetails={() => toast.show('Assignment details coming soon', 'info')}
          />
        </View>
      </ScrollView>

      <StudentHomeworkFab onPress={() => toast.show('Add note coming soon', 'info')} />
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
    gap: spacing['2xl'],
  },
  diarySection: {
    gap: spacing.md,
  },
  diaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  diaryTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primaryContainer,
  },
  monthBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  monthLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primaryContainer,
    letterSpacing: 0.5,
  },
});
