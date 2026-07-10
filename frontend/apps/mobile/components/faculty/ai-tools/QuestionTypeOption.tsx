import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CheckSquare, Square, HelpCircle, AlignLeft, FileText } from 'lucide-react-native';
import type { FacultyAiQuestionType } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';

const ICONS = {
  mcq: HelpCircle,
  short: AlignLeft,
  long: FileText,
} as const;

interface QuestionTypeOptionProps {
  option: FacultyAiQuestionType;
  checked: boolean;
  onToggle: () => void;
}

export function QuestionTypeOption({ option, checked, onToggle }: QuestionTypeOptionProps) {
  const Icon = ICONS[option.id as keyof typeof ICONS] ?? FileText;

  return (
    <Pressable
      style={[styles.row, checked && styles.rowChecked]}
      onPress={onToggle}
    >
      {checked ? (
        <CheckSquare size={20} color={colors.primary} />
      ) : (
        <Square size={20} color={colors.textSecondary} />
      )}
      <View style={styles.textWrap}>
        <Text style={[styles.label, checked && styles.labelActive]}>{option.label}</Text>
        <Text style={styles.description}>{option.description}</Text>
      </View>
      <Icon size={22} color={checked ? colors.primary : colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surface,
  },
  rowChecked: {
    backgroundColor: '#F3F4F5',
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  labelActive: {
    color: colors.primary,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
});
