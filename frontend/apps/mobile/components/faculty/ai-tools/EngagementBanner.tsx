import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import type { FacultyAiEngagementBanner } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface EngagementBannerProps {
  banner: FacultyAiEngagementBanner;
}

export function EngagementBanner({ banner }: EngagementBannerProps) {
  return (
    <View style={styles.wrap}>
      <ImageBackground
        source={{ uri: banner.imageUrl }}
        style={styles.image}
        imageStyle={styles.imageInner}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <Text style={styles.eyebrow}>{banner.eyebrow}</Text>
          <Text style={styles.title}>{banner.title}</Text>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radii.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    marginTop: spacing.lg,
  },
  image: {
    width: '100%',
    height: 192,
    justifyContent: 'flex-end',
  },
  imageInner: {
    borderRadius: radii.xl,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,52,43,0.8)',
    justifyContent: 'flex-end',
    padding: spacing['2xl'],
  },
  eyebrow: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
});
