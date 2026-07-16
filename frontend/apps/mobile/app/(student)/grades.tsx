import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useGrades } from '@piiaura/hooks';
import { colors, spacing, typography, radii } from '@piiaura/ui';
import { useModuleWalkthrough } from '@/components/walkthrough/WalkthroughProvider';

export default function StudentGradesScreen() {
  useModuleWalkthrough('exams');
  const { data, isLoading } = useGrades();

  if (isLoading || !data) {
    return (
      <View style={styles.screen}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading grades...</Text>
        </View>
      </View>
    );
  }

  const average =
    data.length > 0
      ? Math.round(data.reduce((sum, grade) => sum + grade.marks, 0) / data.length)
      : null;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.intro}>
          <Text style={styles.title}>Grades</Text>
          <Text style={styles.description}>Published exam results from EduOS</Text>
        </View>

        {average !== null ? (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Average score</Text>
            <Text style={styles.summaryValue}>{average}%</Text>
            <Text style={styles.summaryMeta}>{data.length} published result(s)</Text>
          </View>
        ) : null}

        <View style={styles.list}>
          {data.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No grades yet</Text>
              <Text style={styles.emptySubtitle}>EduOS has no published results for this student</Text>
            </View>
          ) : (
            data.map((grade) => (
              <View key={grade.id} style={styles.row}>
                <View style={styles.scoreBubble}>
                  <Text style={styles.scoreText}>{Math.round(grade.marks)}%</Text>
                </View>
                <View style={styles.rowText}>
                  <Text style={styles.rowTitle}>{grade.subject}</Text>
                  <Text style={styles.rowMeta}>
                    {grade.examType}
                    {grade.grade ? ` · ${grade.grade}` : ''}
                  </Text>
                  {grade.date ? <Text style={styles.rowDate}>{grade.date}</Text> : null}
                </View>
              </View>
            ))
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
    padding: spacing.lg,
    paddingBottom: spacing['4xl'],
    gap: spacing.lg,
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
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radii.xl,
    padding: spacing.xl,
    gap: spacing.xs,
  },
  summaryLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  summaryValue: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primaryContainer,
  },
  summaryMeta: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  list: {
    gap: spacing.md,
  },
  row: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radii.xl,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  scoreBubble: {
    width: 56,
    height: 56,
    borderRadius: radii.full,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.primaryContainer,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  rowMeta: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  rowDate: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radii.xl,
    padding: spacing.xl,
    gap: spacing.xs,
  },
  emptyTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  emptySubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
});
