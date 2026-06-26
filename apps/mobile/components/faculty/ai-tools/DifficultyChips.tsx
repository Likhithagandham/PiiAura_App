import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { FacultyAiDifficulty } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';

const OPTIONS: { key: FacultyAiDifficulty; label: string }[] = [
  { key: 'easy', label: 'Easy' },
  { key: 'medium', label: 'Medium' },
  { key: 'hard', label: 'Hard' },
];

interface DifficultyChipsProps {
  value: FacultyAiDifficulty;
  onChange: (value: FacultyAiDifficulty) => void;
}

export function DifficultyChips({ value, onChange }: DifficultyChipsProps) {
  return (
    <View style={styles.row}>
      {OPTIONS.map((option) => {
        const active = value === option.key;
        return (
          <Pressable
            key={option.key}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onChange(option.key)}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chip: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: '#00201A',
  },
});
