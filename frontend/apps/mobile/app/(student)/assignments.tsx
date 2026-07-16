import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAssignments } from '@piiaura/hooks';
import { colors, spacing, typography, radii } from '@piiaura/ui';
import { useModuleWalkthrough } from '@/components/walkthrough/WalkthroughProvider';

function formatDueDate(value: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function StudentAssignmentsScreen() {
  useModuleWalkthrough('learn');
  const { data, isLoading } = useAssignments('student');

  if (isLoading || !data) {
    return (
      <View style={styles.screen}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading assignments...</Text>
        </View>
      </View>
    );
  }

  const pending = data.filter((item) => item.status === 'pending' || item.status === 'overdue').length;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.intro}>
          <Text style={styles.title}>Assignments</Text>
          <Text style={styles.description}>
            {data.length
              ? `${data.length} assignment(s) from EduOS · ${pending} pending`
              : 'No assignments in EduOS yet'}
          </Text>
        </View>

        <View style={styles.list}>
          {data.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Nothing assigned</Text>
              <Text style={styles.emptySubtitle}>
                When faculty publishes examination assignments, they appear here and under Learn
              </Text>
            </View>
          ) : (
            data.map((item) => (
              <View key={item.id} style={styles.row}>
                <View style={styles.rowHeader}>
                  <Text style={styles.subject}>{item.subject}</Text>
                  <View
                    style={[
                      styles.statusPill,
                      item.status === 'graded' || item.status === 'submitted'
                        ? styles.statusDone
                        : item.status === 'overdue'
                          ? styles.statusOverdue
                          : styles.statusPending,
                    ]}
                  >
                    <Text style={styles.statusText}>{item.status}</Text>
                  </View>
                </View>
                <Text style={styles.rowTitle}>{item.title}</Text>
                {item.description ? <Text style={styles.rowBody}>{item.description}</Text> : null}
                <Text style={styles.rowMeta}>
                  Due {formatDueDate(item.dueDate) || 'TBD'}
                  {typeof item.maxMarks === 'number' ? ` · Max ${item.maxMarks}` : ''}
                  {typeof item.obtainedMarks === 'number' ? ` · Scored ${item.obtainedMarks}` : ''}
                </Text>
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
  list: {
    gap: spacing.md,
  },
  row: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  subject: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.primaryContainer,
    textTransform: 'uppercase',
    letterSpacing: 1,
    flex: 1,
  },
  statusPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  statusDone: {
    backgroundColor: '#ECFDF5',
  },
  statusOverdue: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
    textTransform: 'capitalize',
  },
  rowTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  rowBody: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.sm * 1.4,
  },
  rowMeta: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
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
