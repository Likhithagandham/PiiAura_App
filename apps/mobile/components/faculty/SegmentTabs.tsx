import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '@piiaura/ui';

export type SegmentTabKey = 'calendar' | 'weekly';

interface SegmentTabsProps {
  active: SegmentTabKey;
  onChange: (key: SegmentTabKey) => void;
}

export function SegmentTabs({ active, onChange }: SegmentTabsProps) {
  return (
    <View style={styles.container}>
      <Pressable onPress={() => onChange('calendar')} style={styles.tab}>
        <Text style={[styles.tabText, active === 'calendar' && styles.activeText]}>
          Calendar view
        </Text>
        {active === 'calendar' ? <View style={styles.underline} /> : null}
      </Pressable>
      <Pressable onPress={() => onChange('weekly')} style={styles.tab}>
        <Text style={[styles.tabText, active === 'weekly' && styles.activeText]}>
          Weekly timetable
        </Text>
        {active === 'weekly' ? <View style={styles.underline} /> : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing['2xl'],
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
    paddingHorizontal: spacing.xs,
  },
  tab: {
    paddingBottom: spacing.sm,
    position: 'relative',
  },
  tabText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
  },
  activeText: {
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
  },
  underline: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 2,
    backgroundColor: colors.primary,
  },
});

