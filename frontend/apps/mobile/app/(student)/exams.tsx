import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Download } from 'lucide-react-native';
import type { StudentExamsTab } from '@piiaura/types';
import { useStudentExams } from '@piiaura/hooks';
import { colors, spacing, typography, radii } from '@piiaura/ui';
import { StudentExamsViewTabs } from '@/components/student/exams/StudentExamsViewTabs';
import { StudentExamsFeaturedCard } from '@/components/student/exams/StudentExamsFeaturedCard';
import { StudentExamsScheduleList } from '@/components/student/exams/StudentExamsScheduleList';
import { StudentExamsPerformanceOverview } from '@/components/student/exams/StudentExamsPerformanceOverview';
import { StudentExamsBreakdownList } from '@/components/student/exams/StudentExamsBreakdownList';
import { useToast } from '@/components/toast/ToastProvider';
import { useModuleWalkthrough } from '@/components/walkthrough/WalkthroughProvider';

export default function StudentExamsScreen() {
  useModuleWalkthrough('exams');
  const { data, isLoading } = useStudentExams();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<StudentExamsTab>('schedule');
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

  const activeUnit = useMemo(() => {
    if (!data) return null;
    const units = data.results.units;
    const match = units.find((unit) => unit.id === selectedUnitId);
    return match ?? units[0] ?? null;
  }, [data, selectedUnitId]);

  const cycleUnit = () => {
    if (!data) return;
    const units = data.results.units;
    const currentIndex = units.findIndex((unit) => unit.id === activeUnit?.id);
    const nextIndex = (currentIndex + 1) % units.length;
    setSelectedUnitId(units[nextIndex]?.id ?? null);
  };

  if (isLoading || !data || !activeUnit) {
    return (
      <View style={styles.screen}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading exams...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <StudentExamsViewTabs
          active={activeTab}
          scheduleLabel={data.scheduleTabLabel}
          resultsLabel={data.resultsTabLabel}
          onChange={setActiveTab}
        />

        {activeTab === 'schedule' ? (
          <View style={styles.section}>
            <View style={styles.scheduleHeader}>
              <Text style={styles.sectionTitle}>{data.upcomingExamsTitle}</Text>
              <Pressable
                style={styles.hallTicketBtn}
                onPress={() => toast.show('Hall ticket download coming soon', 'info')}
              >
                <Download size={18} color={colors.white} />
                <Text style={styles.hallTicketLabel}>{data.hallTicketLabel}</Text>
              </Pressable>
            </View>

            <StudentExamsFeaturedCard featured={data.featuredExam} />

            <StudentExamsScheduleList
              exams={data.upcomingExams}
              onExamPress={() => toast.show('Exam details coming soon', 'info')}
            />
          </View>
        ) : (
          <View style={styles.section}>
            <StudentExamsPerformanceOverview
              title={data.results.overviewTitle}
              unit={activeUnit}
              onUnitPress={cycleUnit}
            />
            <StudentExamsBreakdownList
              title={data.results.breakdownTitle}
              subjects={activeUnit.breakdown}
            />
          </View>
        )}
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
  section: {
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
    flex: 1,
  },
  hallTicketBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  hallTicketLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
    letterSpacing: 0.5,
  },
});
