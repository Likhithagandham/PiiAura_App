import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Calendar, ChevronRight, Megaphone } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import type { StudentDashboardEmptyState, StudentUpcomingExam } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface StudentUpcomingExamsSectionProps {
  title: string;
  count: number;
  exam: StudentUpcomingExam;
  nextExamLabel: string;
}

export function StudentUpcomingExamsSection({
  title,
  count,
  exam,
  nextExamLabel,
}: StudentUpcomingExamsSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{count} Total</Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.examRow}>
          <View style={styles.examLeft}>
            <View style={styles.examIcon}>
              <Text style={styles.examLetter}>{exam.iconLetter}</Text>
            </View>
            <View>
              <Text style={styles.examSubject}>{exam.subject}</Text>
              <Text style={styles.examDate}>{exam.dateTimeLabel}</Text>
            </View>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Add to calendar">
            <Calendar size={22} color={colors.primaryContainer} />
          </Pressable>
        </View>
        <View style={styles.footer}>
          <Text style={styles.nextExam}>{nextExamLabel}</Text>
          <ChevronRight size={14} color={colors.textMuted} />
        </View>
      </View>
    </View>
  );
}

interface StudentDashboardEmptyCardProps {
  title: string;
  empty: StudentDashboardEmptyState;
  Icon: LucideIcon;
  dashed?: boolean;
}

export function StudentDashboardEmptyCard({
  title,
  empty,
  Icon,
  dashed = false,
}: StudentDashboardEmptyCardProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      <View style={[styles.emptyCard, dashed && styles.emptyCardDashed]}>
        <View style={styles.emptyIcon}>
          <Icon size={22} color={colors.textMuted} />
        </View>
        <Text style={styles.emptyTitle}>{empty.title}</Text>
        <Text style={styles.emptySubtitle}>{empty.subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primaryContainer,
  },
  countBadge: {
    backgroundColor: '#78350F',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.md,
  },
  countText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radii.xl,
    overflow: 'hidden',
  },
  examRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  examLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  examIcon: {
    width: 48,
    height: 48,
    borderRadius: radii.lg,
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  examLetter: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    fontStyle: 'italic',
    color: colors.primaryContainer,
  },
  examSubject: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.primaryContainer,
  },
  examDate: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceContainer,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  nextExam: {
    fontSize: 10,
    fontStyle: 'italic',
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radii.xl,
    padding: spacing['2xl'],
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyCardDashed: {
    borderStyle: 'dashed',
    borderWidth: 2,
    backgroundColor: 'rgba(248,250,252,0.3)',
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  emptyTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  emptySubtitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
