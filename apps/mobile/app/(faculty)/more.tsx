import { View, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { ROUTES, WALKTHROUGH_TARGETS } from '@piiaura/constants';
import { useAuth } from '@piiaura/hooks';
import { colors, spacing } from '@piiaura/ui';
import { WalkthroughTarget, useModuleWalkthrough } from '@/components/walkthrough/WalkthroughProvider';
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
  useModuleWalkthrough('more');
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
        <WalkthroughTarget id={WALKTHROUGH_TARGETS.FACULTY.MORE_AI}>
          <FacultyAiAssistantCard onPress={() => router.push(ROUTES.FACULTY.AI_TOOLS as never)} />
        </WalkthroughTarget>

        <WalkthroughTarget id={WALKTHROUGH_TARGETS.FACULTY.MORE_ACADEMIC}>
          <FacultyModuleSection
            title="Academic"
            moduleCount={FACULTY_ACADEMIC_MODULES.length}
            items={FACULTY_ACADEMIC_MODULES}
            variant="academic"
            onItemPress={handleModulePress}
          />
        </WalkthroughTarget>

        <WalkthroughTarget id={WALKTHROUGH_TARGETS.FACULTY.MORE_ADMIN}>
          <FacultyModuleSection
            title="Administrative"
            moduleCount={FACULTY_ADMIN_MODULES.length}
            items={FACULTY_ADMIN_MODULES}
            variant="admin"
            onItemPress={handleModulePress}
          />
        </WalkthroughTarget>

        <WalkthroughTarget id={WALKTHROUGH_TARGETS.FACULTY.MORE_SYSTEM}>
          <FacultySystemList items={FACULTY_SYSTEM_ITEMS} onItemPress={handleSystemPress} />
        </WalkthroughTarget>
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
