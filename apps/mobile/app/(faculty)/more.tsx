import { View, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { ROUTES } from '@piiaura/constants';
import { useAuth } from '@piiaura/hooks';
import { colors, spacing } from '@piiaura/ui';
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
  const { logout } = useAuth();

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

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <FacultyAiAssistantCard onPress={() => router.push(ROUTES.FACULTY.AI_TOOLS as never)} />

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
  content: {
    padding: spacing.lg,
    paddingBottom: spacing['4xl'],
    gap: spacing['2xl'],
  },
});
