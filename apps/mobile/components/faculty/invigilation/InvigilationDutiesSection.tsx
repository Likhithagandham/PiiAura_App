import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { FacultyInvigilationDuty } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';
import { InvigilationDutyCard } from './InvigilationDutyCard';
import { InvigilationEmptyDuties } from './InvigilationEmptyDuties';

interface InvigilationDutiesSectionProps {
  title: string;
  subtitle: string;
  refreshLabel: string;
  duties: FacultyInvigilationDuty[];
  emptyMessage: string;
  onRefresh?: () => Promise<void>;
}

export function InvigilationDutiesSection({
  title,
  subtitle,
  refreshLabel,
  duties,
  emptyMessage,
  onRefresh,
}: InvigilationDutiesSectionProps) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!onRefresh || refreshing) return;
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <Pressable
          style={[styles.refreshBtn, refreshing && styles.refreshBtnDisabled]}
          onPress={handleRefresh}
          disabled={refreshing}
        >
          <Text style={styles.refreshText}>{refreshing ? 'Updating...' : refreshLabel}</Text>
        </Pressable>
      </View>

      <View style={styles.list}>
        {duties.map((duty) => (
          <InvigilationDutyCard key={duty.id} duty={duty} />
        ))}
        <InvigilationEmptyDuties message={emptyMessage} />
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
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
    gap: spacing['2xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  refreshBtn: {
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  refreshBtnDisabled: {
    opacity: 0.5,
  },
  refreshText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  list: {
    gap: spacing.lg,
  },
});
