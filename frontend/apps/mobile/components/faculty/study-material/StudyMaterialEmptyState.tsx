import { StyleSheet, Text, View } from 'react-native';
import { FolderX } from 'lucide-react-native';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface StudyMaterialEmptyStateProps {
  title: string;
  description: string;
}

export function StudyMaterialEmptyState({ title, description }: StudyMaterialEmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <FolderX size={32} color={colors.textSecondary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
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
    paddingVertical: spacing['3xl'],
    paddingHorizontal: spacing.lg,
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
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 240,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
});
