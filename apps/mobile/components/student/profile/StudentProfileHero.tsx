import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Camera, GraduationCap } from 'lucide-react-native';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface StudentProfileHeroProps {
  name: string;
  rollLabel: string;
  programBadge: string;
  avatarUrl: string;
  onEditPhoto: () => void;
}

export function StudentProfileHero({
  name,
  rollLabel,
  programBadge,
  avatarUrl,
  onEditPhoto,
}: StudentProfileHeroProps) {
  return (
    <View style={styles.card}>
      <View style={styles.avatarWrap}>
        <Image source={{ uri: avatarUrl }} style={styles.avatar} accessibilityLabel={`${name} profile photo`} />
        <Pressable style={styles.cameraBtn} onPress={onEditPhoto} accessibilityLabel="Change profile photo">
          <Camera size={18} color={colors.white} />
        </Pressable>
      </View>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.roll}>{rollLabel}</Text>
      <View style={styles.programBadge}>
        <GraduationCap size={14} color="#576867" />
        <Text style={styles.programText}>{programBadge}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.xl,
    padding: spacing.lg,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: radii.full,
    borderWidth: 4,
    borderColor: colors.primaryContainer,
  },
  cameraBtn: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#00342B',
    padding: 6,
    borderRadius: radii.full,
    borderWidth: 2,
    borderColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  name: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  roll: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: spacing.xs,
  },
  programBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    marginTop: spacing.sm,
  },
  programText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: '#576867',
    letterSpacing: 0.5,
  },
});
