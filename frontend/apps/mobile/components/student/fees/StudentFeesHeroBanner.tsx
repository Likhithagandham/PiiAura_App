import { View, Text, StyleSheet } from 'react-native';
import type { StudentFeesBanner } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface StudentFeesBannerProps {
  banner: StudentFeesBanner;
}

export function StudentFeesHeroBanner({ banner }: StudentFeesBannerProps) {
  return (
    <View style={styles.banner}>
      <View style={styles.overlay} />
      <View style={styles.content}>
        <Text style={styles.badge}>{banner.badgeLabel}</Text>
        <Text style={styles.title}>{banner.sessionTitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    height: 160,
    borderRadius: radii.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.primaryContainer,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,52,43,0.15)',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.lg,
    gap: spacing.xs,
    zIndex: 1,
  },
  badge: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
});
