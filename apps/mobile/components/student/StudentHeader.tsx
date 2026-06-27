import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { router, usePathname } from 'expo-router';
import { ArrowLeft, Bell, Search, Settings } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { APP_CONFIG, ROUTES } from '@piiaura/constants';
import { useAuth } from '@piiaura/hooks';
import { Avatar, colors, spacing, typography } from '@piiaura/ui';
import { useToast } from '@/components/toast/ToastProvider';
import { getRouteSegment, getStudentParentTabRoute } from '@/components/student/studentRouteMeta';

interface StudentHeaderProps {
  moduleTitle?: string;
  showBack?: boolean;
  showSearch?: boolean;
  showSettings?: boolean;
  avatarUrl?: string;
}

export function StudentHeader({
  moduleTitle,
  showBack,
  showSearch = false,
  showSettings = false,
  avatarUrl,
}: StudentHeaderProps) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const pathname = usePathname();
  const photo = avatarUrl ?? user?.avatarUrl;

  const handleBack = () => {
    router.replace(getStudentParentTabRoute(pathname) as never);
  };

  const handleAvatarPress = () => {
    if (getRouteSegment(pathname) === 'profile') return;
    router.push(ROUTES.STUDENT.PROFILE as never);
  };

  const avatarButton = (
    <Pressable
      onPress={handleAvatarPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Open profile"
      style={styles.avatarBtn}
    >
      {photo ? (
        <Image source={{ uri: photo }} style={styles.avatar} accessibilityLabel="Profile photo" />
      ) : user ? (
        <Avatar name={user.name} size="sm" tone="dark" />
      ) : null}
    </Pressable>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.left}>
        {showBack ? (
          <Pressable
            onPress={handleBack}
            hitSlop={8}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ArrowLeft size={20} color={colors.primaryContainer} />
          </Pressable>
        ) : null}

        {avatarButton}

        {moduleTitle ? (
          <View style={styles.titleBlock}>
            <Text style={styles.brandSmall}>{APP_CONFIG.APP_NAME}</Text>
            <Text style={styles.moduleTitle} accessibilityRole="header">
              {moduleTitle}
            </Text>
          </View>
        ) : (
          <Text style={styles.brand} accessibilityRole="header">
            {APP_CONFIG.APP_NAME}
          </Text>
        )}
      </View>

      <View style={styles.actions}>
        {showSettings ? (
          <Pressable
            onPress={() => toast.show('Settings coming soon', 'info')}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Settings"
          >
            <Settings size={22} color={colors.primaryContainer} />
          </Pressable>
        ) : (
          <>
            <Pressable
              onPress={() => toast.show('Notifications coming soon', 'info')}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Notifications"
            >
              <Bell size={22} color={colors.textSecondary} />
            </Pressable>
            {showSearch ? (
              <Pressable
                onPress={() => toast.show('Search coming soon', 'info')}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Search"
              >
                <Search size={22} color={colors.textSecondary} />
              </Pressable>
            ) : null}
          </>
        )}
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
    paddingBottom: spacing.md,
    minHeight: 56,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  backBtn: {
    padding: spacing.xs,
    marginRight: -spacing.xs,
  },
  avatarBtn: {
    borderRadius: 999,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceSecondary,
  },
  brand: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: '#00342B',
  },
  titleBlock: {
    gap: 2,
    flexShrink: 1,
  },
  brandSmall: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.primaryContainer,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  moduleTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primaryContainer,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    flexShrink: 0,
  },
});
