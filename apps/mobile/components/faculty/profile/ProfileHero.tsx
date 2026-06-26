import { View, Text, StyleSheet, Image } from 'react-native';
import { BadgeCheck } from 'lucide-react-native';
import type { FacultyProfileBadge } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface ProfileHeroProps {
  name: string;
  designation: string;
  avatarUrl: string;
  verified: boolean;
  badges: FacultyProfileBadge[];
}

const BADGE_STYLES = {
  primary: {
    backgroundColor: colors.primaryContainer,
    color: '#7EBDAC',
  },
  secondary: {
    backgroundColor: colors.secondaryContainer,
    color: '#576867',
  },
} as const;

export function ProfileHero({ name, designation, avatarUrl, verified, badges }: ProfileHeroProps) {
  return (
    <View style={styles.container}>
      <View style={styles.avatarWrap}>
        <View style={styles.avatarRing}>
          <Image source={{ uri: avatarUrl }} style={styles.avatar} accessibilityLabel={`${name} profile photo`} />
        </View>
        {verified ? (
          <View style={styles.verifiedBadge}>
            <BadgeCheck size={16} color={colors.white} />
          </View>
        ) : null}
      </View>

      <Text style={styles.name}>{name}</Text>
      <Text style={styles.designation}>{designation}</Text>

      <View style={styles.badges}>
        {badges.map((badge) => {
          const palette = BADGE_STYLES[badge.variant];
          return (
            <View key={badge.id} style={[styles.badge, { backgroundColor: palette.backgroundColor }]}>
              <Text style={[styles.badgeText, { color: palette.color }]}>{badge.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const AVATAR_SIZE = 128;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing['2xl'],
    gap: spacing.xs,
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatarRing: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 4,
    borderColor: colors.secondaryContainer,
    overflow: 'hidden',
    backgroundColor: colors.surfaceContainerHigh,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 32,
    height: 32,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
  },
  designation: {
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
  },
  badgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: 0.5,
  },
});
