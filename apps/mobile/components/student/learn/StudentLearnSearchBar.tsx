import { View, TextInput, StyleSheet } from 'react-native';
import { Search } from 'lucide-react-native';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface StudentLearnSearchBarProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
}

export function StudentLearnSearchBar({
  placeholder,
  value,
  onChangeText,
}: StudentLearnSearchBarProps) {
  return (
    <View style={styles.container}>
      <Search size={18} color={colors.textMuted} style={styles.icon} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
  },
  icon: {
    position: 'absolute',
    left: spacing.md,
    zIndex: 1,
  },
  input: {
    backgroundColor: '#F3F4F5',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.xl,
    paddingLeft: spacing['3xl'],
    paddingRight: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
});
