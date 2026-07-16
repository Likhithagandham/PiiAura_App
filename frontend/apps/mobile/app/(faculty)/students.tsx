import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useFacultyAttendanceSession } from '@piiaura/hooks';
import { colors, spacing, typography, radii } from '@piiaura/ui';

export default function FacultyStudentsScreen() {
  const { data, isLoading, isError, error, refetch } = useFacultyAttendanceSession();

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <View style={styles.center}>
          <Text style={styles.loadingText}>Loading students...</Text>
        </View>
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={styles.screen}>
        <View style={styles.center}>
          <Text style={styles.errorTitle}>Could not load students</Text>
          <Text style={styles.errorText}>
            {error instanceof Error ? error.message : 'Backend did not return student roster data.'}
          </Text>
          <Pressable style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const students = data.students ?? [];

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Students</Text>
          <Text style={styles.subtitle}>
            {data.title} · {data.periodLabel}
          </Text>
          <Text style={styles.meta}>{students.length} student(s) from backend</Text>
        </View>

        {students.length > 0 ? (
          students.map((student, index) => (
            <View key={student.id} style={styles.row}>
              <Text style={styles.index}>{index + 1}</Text>
              <View style={styles.rowBody}>
                <Text style={styles.name}>{student.name}</Text>
                <Text style={styles.roll}>Roll No: {student.rollNumber}</Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No students in this session</Text>
            <Text style={styles.emptyText}>Backend returned an empty attendance session roster.</Text>
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  loadingText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  errorTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    backgroundColor: colors.primaryContainer,
  },
  retryText: {
    color: colors.white,
    fontWeight: typography.fontWeight.semibold,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing['4xl'],
  },
  header: {
    gap: 4,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  meta: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radii.xl,
    padding: spacing.md,
  },
  index: {
    width: 24,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.primaryContainer,
    textAlign: 'center',
  },
  rowBody: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  roll: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  emptyTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
});
