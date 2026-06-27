import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { StudentExamsTab } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface StudentExamsViewTabsProps {
  active: StudentExamsTab;
  scheduleLabel: string;
  resultsLabel: string;
  onChange: (tab: StudentExamsTab) => void;
}

export function StudentExamsViewTabs({
  active,
  scheduleLabel,
  resultsLabel,
  onChange,
}: StudentExamsViewTabsProps) {
  return (
    <View style={styles.container}>
      <Pressable onPress={() => onChange('schedule')} style={styles.tab}>
        <Text style={[styles.tabText, active === 'schedule' && styles.tabTextActive]}>{scheduleLabel}</Text>
        {active === 'schedule' ? <View style={styles.indicator} /> : null}
      </Pressable>
      <Pressable onPress={() => onChange('results')} style={styles.tab}>
        <Text style={[styles.tabText, active === 'results' && styles.tabTextActive]}>{resultsLabel}</Text>
        {active === 'results' ? <View style={styles.indicator} /> : null}
      </Pressable>
    </View>
  );
}

const TAB_ACTIVE_COLOR = '#00342B';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    position: 'relative',
  },
  tabText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  tabTextActive: {
    color: TAB_ACTIVE_COLOR,
    fontWeight: typography.fontWeight.bold,
  },
  indicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -1,
    height: 3,
    backgroundColor: TAB_ACTIVE_COLOR,
    borderRadius: radii.full,
  },
});
