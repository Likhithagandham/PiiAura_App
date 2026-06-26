import { Pressable, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { CheckCircle } from 'lucide-react-native';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface SaveMarksFabProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function SaveMarksFab({ label, onPress, loading, disabled }: SaveMarksFabProps) {
  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <Pressable
        style={[styles.fab, (loading || disabled) && styles.fabDisabled]}
        onPress={onPress}
        disabled={loading || disabled}
      >
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <CheckCircle size={22} color={colors.white} />
        )}
        <Text style={styles.label}>{loading ? 'Saving...' : label}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    right: spacing['2xl'],
    bottom: spacing['3xl'],
    zIndex: 10,
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.lg,
    borderRadius: radii.full,
    borderWidth: 2,
    borderColor: colors.primaryContainer,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  fabDisabled: {
    opacity: 0.7,
  },
  label: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    letterSpacing: 0.3,
  },
});
