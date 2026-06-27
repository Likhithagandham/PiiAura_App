import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useStudentLeave } from '@piiaura/hooks';
import { colors, spacing, typography } from '@piiaura/ui';
import { StudentLeaveRequestForm } from '@/components/student/leave/StudentLeaveRequestForm';
import { StudentLeaveRequestsTable } from '@/components/student/leave/StudentLeaveRequestsTable';
import { StudentLeaveStatsBento } from '@/components/student/leave/StudentLeaveStatsBento';
import { useToast } from '@/components/toast/ToastProvider';

export default function StudentLeaveScreen() {
  const { data, isLoading } = useStudentLeave();
  const toast = useToast();

  if (isLoading || !data) {
    return (
      <View style={styles.screen}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading leave...</Text>
        </View>
      </View>
    );
  }

  const handleSubmit = async () => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    toast.show('Request submitted successfully', 'success');
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.intro}>
          <Text style={styles.title}>{data.title}</Text>
          <Text style={styles.description}>{data.description}</Text>
        </View>

        <StudentLeaveRequestForm
          leaveTypes={data.leaveTypes}
          submitLabel={data.formSubmitLabel}
          onSubmit={handleSubmit}
        />

        <StudentLeaveRequestsTable
          title={data.requestsTitle}
          viewAllLabel={data.viewAllLabel}
          headers={data.tableHeaders}
          requests={data.requests}
          onViewAll={() => toast.show('Full leave history coming soon', 'info')}
        />

        <StudentLeaveStatsBento stats={data.stats} />
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
    lineHeight: typography.fontSize.md * 1.4,
  },
});
