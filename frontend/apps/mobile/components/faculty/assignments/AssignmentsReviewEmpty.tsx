import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MessageSquare } from 'lucide-react-native';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface AssignmentsReviewEmptyProps {
  title: string;
  description: string;
  refreshLabel: string;
  onRefresh: () => void;
}

export function AssignmentsReviewEmpty({
  title,
  description,
  refreshLabel,
  onRefresh,
}: AssignmentsReviewEmptyProps) {
  return (
    <View
      style={styles.container}
      accessibilityRole="summary"
      accessibilityLabel={`${title}. ${description}`}
    >
      <View
        style={styles.iconWrap}
        accessibilityElementsHidden
        importantForAccessibility="no"
      >
        <MessageSquare size={32} color={colors.textSecondary} />
      </View>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      <Text style={styles.description}>{description}</Text>
      <Pressable
        style={styles.refreshBtn}
        onPress={onRefresh}
        accessibilityRole="button"
        accessibilityLabel={refreshLabel}
        accessibilityHint="Checks for new submissions to review"
      >
        <Text style={styles.refreshText}>{refreshLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F3F4F5',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.outlineVariant,
    borderRadius: radii.xl,
    padding: spacing['2xl'],
    alignItems: 'center',
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  description: {
    marginTop: spacing.sm,
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  refreshBtn: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radii.full,
    minHeight: 44,
    justifyContent: 'center',
  },
  refreshText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
});
