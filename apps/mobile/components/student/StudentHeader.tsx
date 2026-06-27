import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Bell, Search } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { APP_CONFIG, ROUTES } from '@piiaura/constants';
import { useAuth } from '@piiaura/hooks';
import { Avatar, colors, spacing, typography } from '@piiaura/ui';
import { useToast } from '@/components/toast/ToastProvider';

interface StudentHeaderProps {
  title?: string;
  showBack?: boolean;
  avatarUrl?: string;
}

export function StudentHeader({ title, showBack, avatarUrl }: StudentHeaderProps) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const photo = avatarUrl ?? user?.avatarUrl;
  const headerTitle = title ?? APP_CONFIG.APP_NAME;

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(ROUTES.STUDENT.MORE as never);
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
          >
            <ArrowLeft size={20} color={colors.primaryContainer} />
          </Pressable>
        ) : (
          <>
            {photo ? (
              <Image source={{ uri: photo }} style={styles.avatar} accessibilityLabel="Profile photo" />
            ) : user ? (
              <Avatar name={user.name} size="sm" tone="dark" />
            ) : null}
          </>
        )}
        <Text style={styles.brand} accessibilityRole="header">
          {headerTitle}
        </Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={() => toast.show('Notifications coming soon', 'info')}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
        >
          <Bell size={22} color={colors.textSecondary} />
        </Pressable>
        <Pressable
          onPress={() => toast.show('Search coming soon', 'info')}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Search"
        >
          <Search size={22} color={colors.textSecondary} />
        </Pressable>
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
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceSecondary,
  },
  brand: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primaryContainer,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
});
