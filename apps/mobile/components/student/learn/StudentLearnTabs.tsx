import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { StudentLearnMainTab } from '@piiaura/types';
import { colors, spacing, typography } from '@piiaura/ui';

interface StudentLearnTabsProps {
  active: StudentLearnMainTab;
  studyLabel: string;
  assignmentsLabel: string;
  onChange: (tab: StudentLearnMainTab) => void;
}

export function StudentLearnTabs({
  active,
  studyLabel,
  assignmentsLabel,
  onChange,
}: StudentLearnTabsProps) {
  return (
    <View style={styles.container}>
      <Pressable onPress={() => onChange('study')} style={styles.tab}>
        <Text style={[styles.tabText, active === 'study' && styles.tabTextActive]}>{studyLabel}</Text>
        {active === 'study' ? <View style={styles.indicator} /> : null}
      </Pressable>
      <Pressable onPress={() => onChange('assignments')} style={styles.tab}>
        <Text style={[styles.tabText, active === 'assignments' && styles.tabTextActive]}>
          {assignmentsLabel}
        </Text>
        {active === 'assignments' ? <View style={styles.indicator} /> : null}
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
    paddingHorizontal: spacing['2xl'],
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
    left: spacing['2xl'],
    right: spacing['2xl'],
    bottom: 0,
    height: 3,
    backgroundColor: TAB_ACTIVE_COLOR,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
});
