import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { FacultyAiDifficulty } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';

const OPTIONS: { key: FacultyAiDifficulty; label: string }[] = [
  { key: 'easy', label: 'Easy' },
  { key: 'medium', label: 'Medium' },
  { key: 'hard', label: 'Hard' },
];

interface QuizDifficultySegmentProps {
  value: FacultyAiDifficulty;
  onChange: (value: FacultyAiDifficulty) => void;
}

export function QuizDifficultySegment({ value, onChange }: QuizDifficultySegmentProps) {
  return (
    <View style={styles.track}>
      {OPTIONS.map((option) => {
        const active = value === option.key;
        return (
          <Pressable
            key={option.key}
            style={[styles.segment, active && styles.segmentActive]}
            onPress={() => onChange(option.key)}
          >
            <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.full,
    padding: 4,
    minHeight: 48,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.full,
  },
  segmentActive: {
    backgroundColor: colors.secondaryContainer,
  },
  segmentText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
  },
  segmentTextActive: {
    color: '#576867',
  },
});
