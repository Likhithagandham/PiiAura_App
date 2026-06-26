import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useFacultyAttendanceSession } from '@piiaura/hooks';
import { Button, IosToggle, colors, spacing, typography, radii } from '@piiaura/ui';
import { useToast } from '@/components/toast/ToastProvider';

export default function FacultyAttendanceScreen() {
  const insets = useSafeAreaInsets();
  const { data: session, isLoading } = useFacultyAttendanceSession();
  const [presentIds, setPresentIds] = useState<Record<string, boolean>>({});
  const toast = useToast();

  const presentCount = useMemo(
    () => Object.values(presentIds).filter(Boolean).length,
    [presentIds],
  );

  const handleToggle = (studentId: string, value: boolean, studentName?: string) => {
    setPresentIds((prev) => ({ ...prev, [studentId]: value }));
    if (studentName) {
      toast.show(
        value ? `${studentName} marked present` : `${studentName} marked absent`,
        value ? 'success' : 'danger',
      );
    }
  };

  const markAllPresent = () => {
    if (!session) return;
    const next: Record<string, boolean> = {};
    session.students.forEach((s) => {
      next[s.id] = true;
    });
    setPresentIds(next);
  };

  const submit = async () => {
    Alert.alert(
      'Attendance submitted',
      `Successfully recorded attendance for ${presentCount} students.`,
    );
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
        <View style={styles.topLeft}>
          <Pressable
            onPress={() =>
              router.canGoBack() ? router.back() : router.replace('/(faculty)/dashboard')
            }
            hitSlop={8}
            style={styles.backButton}
          >
            <ArrowLeft size={18} color={colors.primary} />
          </Pressable>
          <View style={styles.topTitles}>
            <Text style={styles.topTitle}>Attendance</Text>
            <Text style={styles.topSubtitle}>Grade 10 - Mathematics</Text>
          </View>
        </View>

        <View style={styles.avatar} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: 32 + Math.max(insets.bottom, spacing.lg) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summaryCard}>
          <View style={styles.summaryLeft}>
            <Text style={styles.summaryLabel}>SESSION STATUS</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryCount}>{presentCount}</Text>
              <Text style={styles.summaryOutOf}>
                / {session?.totalStudents ?? 0} Present
              </Text>
            </View>
          </View>
          <View style={styles.summaryRight}>
            <Text style={styles.summaryLabel}>PERIOD</Text>
            <Text style={styles.summaryPeriod}>09:30 AM - 10:30 AM</Text>
          </View>
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.listHeaderText}>Student Name</Text>
          <Pressable onPress={markAllPresent} style={styles.markAll}>
            <Text style={styles.markAllText}>Mark All Present</Text>
          </Pressable>
        </View>

        <View style={styles.listCard}>
          {(session?.students ?? []).map((student, idx) => {
            const isOn = !!presentIds[student.id];
            const initials = student.name
              .split(' ')
              .map((p) => p[0])
              .join('')
              .slice(0, 2)
              .toUpperCase();

            return (
              <View
                key={student.id}
                style={[
                  styles.studentRow,
                  idx !== 0 && styles.studentRowDivider,
                ]}
              >
                <View style={styles.studentLeft}>
                  <View style={styles.studentAvatar}>
                    <Text style={styles.studentInitials}>{initials}</Text>
                  </View>
                  <View>
                    <Text style={styles.studentName}>{student.name}</Text>
                    <Text style={styles.studentMeta}>Roll No: {student.rollNumber}</Text>
                  </View>
                </View>
                <IosToggle
                  value={isOn}
                  onChange={(v) => handleToggle(student.id, v, student.name)}
                />
              </View>
            );
          })}
        </View>

        <Button
          label="Submit Attendance"
          fullWidth
          loading={isLoading}
          onPress={submit}
          style={styles.submitButton}
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
  topBar: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    paddingTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  backButton: {
    width: 28,
    height: 28,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitles: {
    gap: 2,
    flex: 1,
  },
  topTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  topSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerHigh,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLeft: {
    gap: spacing.xs,
  },
  summaryRight: {
    gap: spacing.xs,
    alignItems: 'flex-end',
  },
  summaryLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    letterSpacing: 0.8,
    fontWeight: typography.fontWeight.semibold,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  summaryCount: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  summaryOutOf: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  summaryPeriod: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  listHeaderText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  markAll: {
    backgroundColor: '#AFEFDD',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
  },
  markAllText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primaryContainer,
  },
  listCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    overflow: 'hidden',
  },
  studentRow: {
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  studentRowDivider: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(191,201,196,0.3)',
  },
  studentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  studentAvatar: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentInitials: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.textSecondary,
  },
  studentName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  studentMeta: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  submitButton: {
    borderRadius: radii.lg,
    minHeight: 56,
  },
});
