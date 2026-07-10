import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, School } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar, colors, spacing, typography } from '@piiaura/ui';
import { APP_CONFIG, ROUTES, WALKTHROUGH_TARGETS } from '@piiaura/constants';
import { useAuth, useFacultyProfile } from '@piiaura/hooks';
import { WalkthroughTarget } from '@/components/walkthrough/WalkthroughProvider';

interface FacultyHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onProfilePress?: () => void;
}

export function FacultyHeader({
  title,
  subtitle,
  showBack,
  onProfilePress,
}: FacultyHeaderProps) {
  const { user } = useAuth();
  const { data: profile } = useFacultyProfile();
  const insets = useSafeAreaInsets();
  const headerTitle = title ?? APP_CONFIG.APP_NAME;

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(ROUTES.FACULTY.MORE);
  };

  const handleProfilePress = () => {
    if (onProfilePress) {
      onProfilePress();
      return;
    }
    router.push(ROUTES.FACULTY.PROFILE as never);
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + spacing.sm,
          paddingBottom: spacing.md,
        },
      ]}
    >
      <View style={styles.left}>
        {showBack ? (
          <Pressable
            onPress={handleBack}
            hitSlop={8}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            accessibilityHint="Returns to the previous screen"
          >
            <View accessibilityElementsHidden importantForAccessibility="no">
              <ArrowLeft size={20} color={colors.primary} />
            </View>
          </Pressable>
        ) : null}
        <View style={styles.titleBlock}>
          <Text style={styles.brand} accessibilityRole="header">
            {headerTitle}
          </Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>

      <View style={styles.right}>
        <View
          style={styles.schoolChip}
          accessibilityRole="text"
          accessibilityLabel="School scope"
        >
          <View accessibilityElementsHidden importantForAccessibility="no">
            <School size={14} color={colors.textSecondary} />
          </View>
          <Text style={styles.schoolText}>School</Text>
        </View>

        {user ? (
          <WalkthroughTarget id={WALKTHROUGH_TARGETS.FACULTY.HEADER_PROFILE} style={styles.profileTarget}>
            <Pressable
              onPress={handleProfilePress}
              hitSlop={8}
              style={styles.profileBtn}
              accessibilityRole="button"
              accessibilityLabel="Open profile"
              accessibilityHint="Opens your faculty profile"
            >
              {profile?.avatarUrl ? (
                <Image
                  source={{ uri: profile.avatarUrl }}
                  style={styles.profileAvatar}
                />
              ) : (
                <Avatar name={user.name} size="sm" tone="dark" />
              )}
            </Pressable>
          </WalkthroughTarget>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  backBtn: {
    padding: spacing.xs,
  },
  titleBlock: {
    flex: 1,
    gap: 2,
  },
  brand: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  schoolChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.secondaryContainer,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  schoolText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  profileTarget: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileBtn: {
    borderRadius: 999,
    overflow: 'hidden',
  },
  profileAvatar: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: '#AFEFDD',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
});
