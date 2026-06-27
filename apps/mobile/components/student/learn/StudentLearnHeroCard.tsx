import { View, Text, StyleSheet, Pressable, ImageBackground } from 'react-native';
import { Play } from 'lucide-react-native';
import type { StudentLearnHeroMaterial } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface StudentLearnHeroCardProps {
  material: StudentLearnHeroMaterial;
  onPlay?: () => void;
}

export function StudentLearnHeroCard({ material, onPlay }: StudentLearnHeroCardProps) {
  return (
    <View style={styles.container}>
      <ImageBackground source={{ uri: material.imageUrl }} style={styles.image} imageStyle={styles.imageInner}>
        <View style={styles.overlay}>
          <View style={styles.content}>
            <View style={styles.textBlock}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{material.badgeLabel}</Text>
              </View>
              <Text style={styles.title}>{material.title}</Text>
              <Text style={styles.subtitle}>{material.subtitle}</Text>
            </View>
            <Pressable
              style={styles.playBtn}
              onPress={onPlay}
              accessibilityRole="button"
              accessibilityLabel={`Play ${material.title}`}
            >
              <Play size={22} color="#065043" fill="#065043" />
            </Pressable>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 192,
    borderRadius: radii.xl,
    overflow: 'hidden',
  },
  image: {
    flex: 1,
  },
  imageInner: {
    borderRadius: radii.xl,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,52,43,0.55)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    padding: spacing.lg,
    gap: spacing.md,
  },
  textBlock: {
    flex: 1,
    gap: spacing.xs,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFDCC2',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: '#2E1500',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: '#94D3C1',
  },
  playBtn: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    backgroundColor: '#AFEFDD',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
});
