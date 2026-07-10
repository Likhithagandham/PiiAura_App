import { View, Text, StyleSheet } from 'react-native';
import { LifeBuoy } from 'lucide-react-native';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface HelpSupportIntroProps {
  title: string;
  description: string;
}

export function HelpSupportIntro({ title, description }: HelpSupportIntroProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <LifeBuoy size={28} color={colors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.sm,
    alignItems: 'center',
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: radii.full,
    backgroundColor: colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    textAlign: 'center',
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
});
