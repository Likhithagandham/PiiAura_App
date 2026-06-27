import { Pressable, StyleSheet } from 'react-native';
import { Plus } from 'lucide-react-native';
import { colors, spacing, radii } from '@piiaura/ui';

interface StudentLearnFabProps {
  onPress?: () => void;
}

export function StudentLearnFab({ onPress }: StudentLearnFabProps) {
  return (
    <Pressable
      style={styles.fab}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Add material"
    >
      <Plus size={28} color={colors.white} strokeWidth={2.5} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: 96,
    width: 56,
    height: 56,
    borderRadius: radii.full,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
});
