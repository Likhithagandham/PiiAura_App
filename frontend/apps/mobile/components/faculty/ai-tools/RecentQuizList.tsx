import { Pressable, StyleSheet, Text, View } from 'react-native';
import { HelpCircle, MoreVertical } from 'lucide-react-native';
import type { FacultyAiQuizRecentItem } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface RecentQuizListProps {
  items: FacultyAiQuizRecentItem[];
  onItemPress?: (item: FacultyAiQuizRecentItem) => void;
  onViewAll?: () => void;
}

export function RecentQuizList({ items, onItemPress, onViewAll }: RecentQuizListProps) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Recent Generations</Text>
        <Pressable onPress={onViewAll}>
          <Text style={styles.viewAll}>View All</Text>
        </Pressable>
      </View>
      <View style={styles.list}>
        {items.map((item) => (
          <Pressable
            key={item.id}
            style={styles.card}
            onPress={() => onItemPress?.(item)}
          >
            <View style={styles.iconWrap}>
              <HelpCircle size={22} color={colors.primary} />
            </View>
            <View style={styles.textWrap}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.meta}>{item.metaLabel}</Text>
            </View>
            <MoreVertical size={20} color={colors.textSecondary} />
          </Pressable>
        ))}
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
    paddingHorizontal: spacing.xs,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  viewAll: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  list: {
    gap: spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.xl,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radii.lg,
    backgroundColor: colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  meta: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
});
