import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronRight, Clock } from 'lucide-react-native';
import type { FacultySyllabusSubject } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface SyllabusSubjectCardProps {
  subject: FacultySyllabusSubject;
  onDetails?: (subject: FacultySyllabusSubject) => void;
}

const STATUS_STYLES = {
  'pending-review': {
    backgroundColor: '#FFDCC2',
    color: '#6D3A00',
  },
  'on-track': {
    backgroundColor: colors.secondaryContainer,
    color: '#576867',
  },
} as const;

export function SyllabusSubjectCard({ subject, onDetails }: SyllabusSubjectCardProps) {
  const badge = STATUS_STYLES[subject.status];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.name}>{subject.name}</Text>
          <Text style={styles.classLabel}>{subject.classLabel}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: badge.backgroundColor }]}>
          <Text style={[styles.badgeText, { color: badge.color }]}>{subject.statusLabel}</Text>
        </View>
      </View>

      <View style={styles.progressRow}>
        <Text style={styles.percent}>{subject.percent}%</Text>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${subject.percent}%` }]} />
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.updatedRow}>
          <Clock size={14} color={colors.textSecondary} />
          <Text style={styles.updatedText}>{subject.lastUpdatedLabel}</Text>
        </View>
        <Pressable
          style={styles.detailsBtn}
          onPress={() => onDetails?.(subject)}
          accessibilityRole="button"
          accessibilityLabel={`View details for ${subject.name}`}
          accessibilityHint="Opens chapter progress and status"
        >
          <Text style={styles.detailsText}>Details</Text>
          <ChevronRight size={14} color={colors.primary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  name: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  classLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    textTransform: 'uppercase',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  percent: {
    width: 48,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  track: {
    flex: 1,
    height: 6,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceContainer,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radii.full,
    backgroundColor: colors.primary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
    paddingTop: spacing.sm,
  },
  updatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  updatedText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  detailsText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
});
