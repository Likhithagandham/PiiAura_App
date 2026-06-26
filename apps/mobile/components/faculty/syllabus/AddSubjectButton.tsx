import { Pressable, StyleSheet, Text } from 'react-native';
import { Plus } from 'lucide-react-native';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface AddSubjectButtonProps {
  label: string;
  onPress?: () => void;
}

export function AddSubjectButton({ label, onPress }: AddSubjectButtonProps) {
  return (
    <Pressable
      style={styles.button}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint="Opens form to track another subject"
    >
      <Plus size={20} color={colors.textSecondary} />
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.outlineVariant,
    borderRadius: radii.xl,
    marginTop: spacing.lg,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
  },
});
