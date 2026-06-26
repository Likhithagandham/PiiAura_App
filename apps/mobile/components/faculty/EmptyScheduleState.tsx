import { View, Text, StyleSheet } from 'react-native';
import { CalendarX2 } from 'lucide-react-native';
import { colors, spacing, typography } from '@piiaura/ui';

export function EmptyScheduleState() {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <CalendarX2 size={28} color={colors.textMuted} strokeWidth={1.5} />
      </View>
      <Text style={styles.title}>No sessions today</Text>
      <Text style={styles.subtitle}>Your scheduled classes for today will appear here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
    gap: spacing.sm,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
});
