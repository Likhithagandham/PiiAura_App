import { Pressable, StyleSheet } from 'react-native';
import { NotebookPen } from 'lucide-react-native';
import { colors, spacing, radii } from '@piiaura/ui';

interface StudentHomeworkFabProps {
  onPress?: () => void;
}

export function StudentHomeworkFab({ onPress }: StudentHomeworkFabProps) {
  return (
    <Pressable
      style={styles.fab}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Add note"
    >
      <NotebookPen size={24} color={colors.white} />
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
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});
