import { StyleSheet, Text, View } from 'react-native';
import { BellOff } from 'lucide-react-native';
import { colors, spacing, typography } from '@piiaura/ui';

interface AlertsEmptyStateProps {
  title: string;
  description: string;
}

export function AlertsEmptyState({ title, description }: AlertsEmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <BellOff size={48} color={colors.textMuted} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing['4xl'],
    alignItems: 'center',
    gap: spacing.md,
  },
  iconWrap: {
    opacity: 0.4,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    textAlign: 'center',
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
});
