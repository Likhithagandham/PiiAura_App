import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAttendance } from '@piiaura/hooks';
import { colors, spacing, typography, radii } from '@piiaura/ui';
import { useModuleWalkthrough } from '@/components/walkthrough/WalkthroughProvider';

export default function StudentAttendanceScreen() {
  useModuleWalkthrough('attendance');
  const { data, isLoading } = useAttendance('student');

  if (isLoading || !data) {
    return (
      <View style={styles.screen}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading attendance...</Text>
        </View>
      </View>
    );
  }

  const overall = data.find((row) => row.subject === 'Overall');
  const subjects = data.filter((row) => row.subject !== 'Overall');

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.intro}>
          <Text style={styles.title}>Attendance</Text>
          <Text style={styles.description}>Subject-wise attendance from EduOS</Text>
        </View>

        {overall ? (
          <View style={styles.overallCard}>
            <Text style={styles.overallLabel}>Overall</Text>
            <Text style={styles.overallValue}>{overall.remarks?.split('·')[0]?.trim() || '—'}</Text>
            <Text style={styles.overallMeta}>{overall.remarks}</Text>
          </View>
        ) : null}

        <View style={styles.list}>
          {subjects.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No subject breakdown yet</Text>
              <Text style={styles.emptySubtitle}>EduOS returned overall attendance only</Text>
            </View>
          ) : (
            subjects.map((row) => (
              <View key={row.id} style={styles.row}>
                <View style={styles.rowText}>
                  <Text style={styles.rowTitle}>{row.subject}</Text>
                  <Text style={styles.rowMeta}>{row.remarks}</Text>
                </View>
                <View
                  style={[
                    styles.statusPill,
                    row.status === 'present' ? styles.statusOk : styles.statusWarn,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      row.status === 'present' ? styles.statusOkText : styles.statusWarnText,
                    ]}
                  >
                    {row.status === 'present' ? 'On track' : 'At risk'}
                  </Text>
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
  overallCard: {
    backgroundColor: colors.primaryContainer,
    borderRadius: radii.xl,
    padding: spacing.xl,
    gap: spacing.xs,
  },
  overallLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: '#99F6E4',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  overallValue: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  overallMeta: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255,255,255,0.85)',
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
  rowText: {
    flex: 1,
    gap: 4,
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
  statusPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
  },
  statusOk: {
    backgroundColor: '#ECFDF5',
  },
  statusWarn: {
    backgroundColor: '#FEF2F2',
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  statusOkText: {
    color: colors.primaryContainer,
  },
  statusWarnText: {
    color: '#DC2626',
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
