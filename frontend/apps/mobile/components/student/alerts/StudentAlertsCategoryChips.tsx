import { ScrollView, Pressable, StyleSheet, Text } from 'react-native';
import type { StudentNoticeCategory, StudentNoticeCategoryChip } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface StudentAlertsCategoryChipsProps {
  categories: StudentNoticeCategoryChip[];
  selectedId: StudentNoticeCategory;
  onSelect: (id: StudentNoticeCategory) => void;
}

const CHIP_ACTIVE = '#00342B';

export function StudentAlertsCategoryChips({
  categories,
  selectedId,
  onSelect,
}: StudentAlertsCategoryChipsProps) {
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
    backgroundColor: CHIP_ACTIVE,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  chipInactive: {
    backgroundColor: colors.surfaceContainerHigh,
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
