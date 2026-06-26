import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, School } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar, colors, spacing, typography } from '@piiaura/ui';
import { APP_CONFIG, ROUTES } from '@piiaura/constants';
import { useAuth } from '@piiaura/hooks';

interface FacultyHeaderProps {
  title?: string;
  showBack?: boolean;
  onProfilePress?: () => void;
}

export function FacultyHeader({ title, showBack, onProfilePress }: FacultyHeaderProps) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const headerTitle = title ?? APP_CONFIG.APP_NAME;

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(ROUTES.FACULTY.MORE);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.left}>
        {showBack ? (
          <Pressable onPress={handleBack} hitSlop={8} style={styles.backBtn}>
            <ArrowLeft size={20} color={colors.primary} />
          </Pressable>
        ) : null}
        {!showBack && user ? <Avatar name={user.name} size="sm" tone="dark" /> : null}
        <Text style={styles.brand}>{headerTitle}</Text>
      </View>

      <View style={styles.right}>
        <View style={styles.schoolChip}>
          <School size={14} color={colors.textSecondary} />
          <Text style={styles.schoolText}>School</Text>
        </View>
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
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
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
  brand: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
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
});
