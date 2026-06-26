import { View, Text, StyleSheet, Pressable } from 'react-native';
import type { FacultyPendingTask } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface PriorityAlertsCardProps {
  tasks: FacultyPendingTask[];
  onTaskPress?: (taskId: string) => void;
}

export function PriorityAlertsCard({ tasks, onTaskPress }: PriorityAlertsCardProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>ALERTS</Text>
      </View>
      <View style={styles.list}>
        {tasks.map((task, idx) => (
          <Pressable
            key={task.id}
            style={[styles.item, idx !== 0 && styles.itemSpacing]}
            onPress={() => onTaskPress?.(task.id)}
          >
            <View style={styles.itemLeft}>
              <View style={[styles.accent, { backgroundColor: task.accentColor }]} />
              <Text style={styles.title}>
                {task.title.toLowerCase().includes('leave') ? 'Leave requests' : 'Invigilation'}
              </Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {task.title.toLowerCase().includes('leave')
                  ? `${task.count} pending`
                  : `${task.count} duty`}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  heading: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textMuted,
    letterSpacing: 0.8,
  },
  list: {
    gap: spacing.md,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  itemSpacing: {},
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  accent: {
    width: 4,
    height: 32,
    borderRadius: radii.full,
  },
  title: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: colors.surfaceContainerHigh,
  },
  badgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
  },
});

