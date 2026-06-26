import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ROUTES } from '@piiaura/constants';
import { useAuth } from '@piiaura/hooks';
import { Avatar, colors, spacing, typography } from '@piiaura/ui';
import {
  FACULTY_ACADEMIC_MODULES,
  FACULTY_ADMIN_MODULES,
  FACULTY_SYSTEM_ITEMS,
  FacultyAiAssistantCard,
  FacultyModuleSection,
  FacultySystemList,
  navigateFacultyPortal,
  type FacultyModuleItem,
  type FacultySystemItem,
} from '@/components/faculty/facultyPortalMenu';

export default function FacultyMoreScreen() {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();

  const handleModulePress = (item: FacultyModuleItem) => {
    navigateFacultyPortal(item.route);
  };

  const handleSystemPress = (item: FacultySystemItem) => {
    if (item.id === 'logout') {
      logout();
      router.replace(ROUTES.AUTH.LOGIN);
      return;
    }
    navigateFacultyPortal(item.route);
  };

  const handleClose = () => {
    router.navigate(ROUTES.FACULTY.DASHBOARD);
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <View style={styles.headerLeft}>
          {user ? (
            <View style={styles.avatarRing}>
              <Avatar name={user.name} size="md" tone="dark" />
            </View>
          ) : null}
          <View>
            <Text style={styles.portalTitle}>More</Text>
          </View>
        </View>
        <Pressable style={styles.closeBtn} onPress={handleClose} hitSlop={8}>
          <X size={22} color={colors.textSecondary} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: spacing['4xl'] + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <FacultyAiAssistantCard />

        <FacultyModuleSection
          title="Academic"
          moduleCount={FACULTY_ACADEMIC_MODULES.length}
          items={FACULTY_ACADEMIC_MODULES}
          variant="academic"
          onItemPress={handleModulePress}
        />

        <FacultyModuleSection
          title="Administrative"
          moduleCount={FACULTY_ADMIN_MODULES.length}
          items={FACULTY_ADMIN_MODULES}
          variant="admin"
          onItemPress={handleModulePress}
        />

        <FacultySystemList items={FACULTY_SYSTEM_ITEMS} onItemPress={handleSystemPress} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(191,201,196,0.3)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  avatarRing: {
    borderWidth: 2,
    borderColor: '#AFEFDD',
    borderRadius: 999,
    padding: 2,
    backgroundColor: colors.surface,
  },
  portalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
    lineHeight: typography.fontSize.lg * 1.2,
  },
  closeBtn: {
    padding: spacing.sm,
    borderRadius: 999,
  },
  content: {
    padding: spacing.lg,
    gap: spacing['2xl'],
  },
});
