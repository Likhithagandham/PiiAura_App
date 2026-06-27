import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '@piiaura/ui';

export type TimetableViewTab = 'daily' | 'weekly';

interface StudentTimetableViewTabsProps {
  active: TimetableViewTab;
  onChange: (tab: TimetableViewTab) => void;
}

export function StudentTimetableViewTabs({ active, onChange }: StudentTimetableViewTabsProps) {
  return (
    <View style={styles.container}>
      <Pressable onPress={() => onChange('daily')} style={styles.tab}>
        <Text style={[styles.tabText, active === 'daily' && styles.activeText]}>Daily View</Text>
        {active === 'daily' ? <View style={styles.underline} /> : null}
      </Pressable>
      <Pressable onPress={() => onChange('weekly')} style={styles.tab}>
        <Text style={[styles.tabText, active === 'weekly' && styles.activeText]}>Weekly View</Text>
        {active === 'weekly' ? <View style={styles.underline} /> : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
    position: 'relative',
  },
  tabText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  activeText: {
    color: colors.primaryContainer,
    fontWeight: typography.fontWeight.bold,
  },
  underline: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 2,
    backgroundColor: colors.primaryContainer,
  },
});
