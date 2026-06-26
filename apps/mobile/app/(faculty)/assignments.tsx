import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useFacultyAssignmentsScreen } from '@piiaura/hooks';
import { colors, spacing, typography } from '@piiaura/ui';
import { CreateAssignmentForm } from '@/components/faculty/assignments/CreateAssignmentForm';
import { AssignmentListCard } from '@/components/faculty/assignments/AssignmentListCard';
import { AssignmentsReviewEmpty } from '@/components/faculty/assignments/AssignmentsReviewEmpty';
import { useToast } from '@/components/toast/ToastProvider';

export default function FacultyAssignmentsScreen() {
  const { data, isLoading, refetch } = useFacultyAssignmentsScreen();
  const toast = useToast();

  const handlePublish = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    toast.show('Assignment published successfully', 'success');
  };

  const handleAttach = (file: { name: string; uri: string }) => {
    toast.show(`Attached ${file.name}`, 'success');
  };

  const handleAssignmentOption = (assignment: { title: string }, action: string) => {
    const labels: Record<string, string> = {
      submissions: 'Opening submissions',
      edit: 'Edit assignment coming soon',
      remind: 'Reminder sent to pending students',
    };
    toast.show(labels[action] ?? 'Action completed', 'info');
  };

  const handleRefreshSubmissions = () => {
    refetch();
    toast.show('Submissions refreshed', 'info');
  };

  if (isLoading || !data) {
    return (
      <View style={styles.screen}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        accessibilityLabel="Assignments content"
      >
        <View style={styles.intro} accessibilityRole="header">
          <Text style={styles.title}>{data.title}</Text>
          <Text style={styles.description}>{data.description}</Text>
        </View>

        <CreateAssignmentForm
          classes={data.classes}
          subjects={data.subjects}
          onPublish={handlePublish}
          onAttach={handleAttach}
          onAttachError={(message) => toast.show(message, 'danger')}
        />

        <View style={styles.listSection} accessibilityLabel="Current assignments section">
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle} accessibilityRole="header">
              Current Assignments
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="View all assignments"
              accessibilityHint="Shows the full assignments list"
            >
              <Text style={styles.viewAll}>View All</Text>
            </Pressable>
          </View>
          <View style={styles.list} accessibilityRole="list">
            {data.currentAssignments.map((assignment) => (
              <AssignmentListCard
                key={assignment.id}
                assignment={assignment}
                onOptionSelect={handleAssignmentOption}
              />
            ))}
          </View>
        </View>

        <AssignmentsReviewEmpty
          title={data.reviewEmptyTitle}
          description={data.reviewEmptyDescription}
          refreshLabel={data.reviewRefreshLabel}
          onRefresh={handleRefreshSubmissions}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
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
    gap: spacing['2xl'],
    paddingBottom: spacing['4xl'],
  },
  intro: {
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  listSection: {
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  viewAll: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  list: {
    gap: spacing.sm,
  },
});
