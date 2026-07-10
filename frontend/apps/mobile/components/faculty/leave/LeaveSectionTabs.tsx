import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RefreshCw } from 'lucide-react-native';
import { colors, spacing, typography } from '@piiaura/ui';

export type LeaveTabKey = 'my' | 'student';

interface LeaveSectionTabsProps {
  active: LeaveTabKey;
  onChange: (key: LeaveTabKey) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function LeaveSectionTabs({
  active,
  onChange,
  onRefresh,
  refreshing,
}: LeaveSectionTabsProps) {
  return (
    <View style={styles.container}>
      <Pressable onPress={() => onChange('my')} style={styles.tab}>
        <Text style={[styles.tabText, active === 'my' && styles.activeText]}>My Leave</Text>
        {active === 'my' ? <View style={styles.underline} /> : null}
      </Pressable>
      <Pressable onPress={() => onChange('student')} style={styles.tab}>
        <Text style={[styles.tabText, active === 'student' && styles.activeText]}>
          Student Leave
        </Text>
        {active === 'student' ? <View style={styles.underline} /> : null}
      </Pressable>
      {onRefresh ? (
        <Pressable
          onPress={onRefresh}
          style={styles.refreshBtn}
          disabled={refreshing}
          hitSlop={8}
        >
          <RefreshCw
            size={20}
            color={colors.primary}
            style={refreshing ? styles.spinning : undefined}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  tab: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
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
    left: spacing.lg,
    right: spacing.lg,
    bottom: 0,
    height: 2,
    backgroundColor: colors.primary,
  },
  refreshBtn: {
    marginLeft: 'auto',
    padding: spacing.sm,
  },
  spinning: {
    opacity: 0.5,
  },
});
