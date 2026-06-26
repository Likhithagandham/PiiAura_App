import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Pencil } from 'lucide-react-native';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface SettingsProfileCardProps {
  name: string;
  subtitle: string;
  avatarUrl: string;
  employeeIdLabel: string;
  onEditPress?: () => void;
  onPress?: () => void;
}

export function SettingsProfileCard({
  name,
  subtitle,
  avatarUrl,
  employeeIdLabel,
  onEditPress,
  onPress,
}: SettingsProfileCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress} disabled={!onPress}>
      <View style={styles.avatarWrap}>
        <View style={styles.avatarRing}>
          <Image source={{ uri: avatarUrl }} style={styles.avatar} accessibilityLabel={`${name} photo`} />
        </View>
        <Pressable
          style={styles.editBtn}
          onPress={(event) => {
            event.stopPropagation();
            onEditPress?.();
          }}
          accessibilityRole="button"
          accessibilityLabel="Edit profile photo"
        >
          <Pencil size={18} color={colors.white} />
        </Pressable>
      </View>

      <Text style={styles.name}>{name}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      <View style={styles.idBadge}>
        <Text style={styles.idText}>{employeeIdLabel}</Text>
      </View>
    </Pressable>
  );
}

const AVATAR_SIZE = 96;

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.xl,
    padding: spacing['2xl'],
    gap: spacing.xs,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
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
    borderColor: '#AFEFDD',
    overflow: 'hidden',
    backgroundColor: colors.surfaceContainerHigh,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  editBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  name: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  idBadge: {
    marginTop: spacing.sm,
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
  },
  idText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: '#576867',
    letterSpacing: 0.5,
  },
});
