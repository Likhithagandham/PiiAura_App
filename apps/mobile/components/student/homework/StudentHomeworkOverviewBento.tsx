import { View, Text, StyleSheet } from 'react-native';
import { BookOpen, CalendarClock, ListTodo } from 'lucide-react-native';
import type { StudentHomeworkOverview } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface StudentHomeworkOverviewBentoProps {
  overview: StudentHomeworkOverview;
}

export function StudentHomeworkOverviewBento({ overview }: StudentHomeworkOverviewBentoProps) {
  return (
    <View style={styles.grid}>
      <View style={styles.heroCard}>
        <View style={styles.heroDecor}>
          <BookOpen size={96} color="rgba(255,255,255,0.12)" fill="rgba(255,255,255,0.08)" />
        </View>
        <View style={styles.heroContent}>
          <Text style={styles.progressLabel}>{overview.progressLabel}</Text>
          <Text style={styles.heroTitle}>{overview.title}</Text>
          <View style={styles.progressRow}>
            <Text style={styles.progressValue}>{overview.progressPercent}%</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${overview.progressPercent}%` }]} />
            </View>
          </View>
          <Text style={styles.summary}>{overview.summaryLabel}</Text>
        </View>
      </View>

      <View style={styles.statCard}>
        <ListTodo size={22} color={colors.primaryContainer} />
        <View>
          <Text style={styles.statLabel}>{overview.pendingLabel}</Text>
          <Text style={styles.statValue}>{overview.pendingValue}</Text>
        </View>
      </View>

      <View style={styles.statCard}>
        <CalendarClock size={22} color="#FF972C" />
        <View>
          <Text style={styles.statLabel}>{overview.nextDueLabel}</Text>
          <Text style={[styles.statValue, styles.statValueAccent]}>{overview.nextDueValue}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  heroCard: {
    width: '100%',
    backgroundColor: colors.primaryContainer,
    borderRadius: radii.xl,
    padding: spacing.lg,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  heroDecor: {
    position: 'absolute',
    right: -16,
    bottom: -16,
  },
  heroContent: {
    gap: spacing.sm,
    zIndex: 1,
  },
  progressLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.md,
  },
  progressValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: '#7EBDAC',
  },
  progressTrack: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radii.full,
    marginBottom: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#7EBDAC',
    borderRadius: radii.full,
  },
  summary: {
    fontSize: typography.fontSize.md,
    color: 'rgba(255,255,255,0.9)',
    marginTop: spacing.xs,
  },
  statCard: {
    width: '47.5%',
    flexGrow: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.xl,
    padding: spacing.lg,
    justifyContent: 'space-between',
    minHeight: 108,
    gap: spacing.sm,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primaryContainer,
  },
  statValueAccent: {
    color: '#6D3A00',
  },
});
