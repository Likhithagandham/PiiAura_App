import { ScrollView, Pressable, StyleSheet, Text } from 'react-native';
import type { StudentLearnCategory } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface StudentLearnCategoryChipsProps {
  categories: StudentLearnCategory[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function StudentLearnCategoryChips({
  categories,
  selectedId,
  onSelect,
}: StudentLearnCategoryChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {categories.map((category) => {
        const isSelected = category.id === selectedId;
        return (
          <Pressable
            key={category.id}
            onPress={() => onSelect(category.id)}
            style={[styles.chip, isSelected ? styles.chipActive : styles.chipInactive]}
          >
            <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
              {category.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
  },
  chipActive: {
    backgroundColor: colors.primaryContainer,
  },
  chipInactive: {
    backgroundColor: colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  chipText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  chipTextActive: {
    color: colors.white,
  },
});
