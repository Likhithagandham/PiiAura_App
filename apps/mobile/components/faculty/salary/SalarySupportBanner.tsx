import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Info } from 'lucide-react-native';
import type { FacultySalarySupport } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface SalarySupportBannerProps {
  support: FacultySalarySupport;
  onAction?: () => void;
}

export function SalarySupportBanner({ support, onAction }: SalarySupportBannerProps) {
  return (
    <View style={styles.banner}>
      <Info size={22} color={colors.primary} style={styles.icon} />
      <View style={styles.content}>
        <Text style={styles.title}>{support.title}</Text>
        <Text style={styles.description}>{support.description}</Text>
        <Pressable onPress={onAction}>
          <Text style={styles.action}>{support.actionLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    gap: spacing.lg,
    backgroundColor: 'rgba(212,230,229,0.3)',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.xl,
    padding: spacing.lg,
  },
  icon: {
    marginTop: spacing.xs,
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
    marginBottom: spacing.sm,
  },
  action: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
});
