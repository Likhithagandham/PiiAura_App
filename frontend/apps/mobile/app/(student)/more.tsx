import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { ROUTES } from '@piiaura/constants';
import { useAuth, useStudentMore } from '@piiaura/hooks';
import type { StudentMoreHubTile, StudentMoreSystemItem } from '@piiaura/types';
import { colors, spacing, typography } from '@piiaura/ui';
import {
  StudentMoreHeroBanner,
  StudentMoreModuleGrid,
  StudentMoreSystemList,
  getStudentMoreTileRoute,
  getStudentMoreSystemRoute,
  navigateStudentPortal,
} from '@/components/student/more/studentMoreSections';
import { useToast } from '@/components/toast/ToastProvider';

export default function StudentMoreScreen() {
  const { data, isLoading } = useStudentMore();
  const { logout } = useAuth();
  const toast = useToast();

  if (isLoading || !data) {
    return (
      <View style={styles.screen}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  const handleTilePress = (tile: StudentMoreHubTile) => {
    const route = getStudentMoreTileRoute(tile.id);
    if (route) {
      navigateStudentPortal(route);
      return;
    }
    toast.show(`${tile.label} coming soon`, 'info');
  };

  const handleSystemPress = (item: StudentMoreSystemItem) => {
    if (item.id === 'logout') {
      logout();
      router.replace(ROUTES.AUTH.LOGIN);
      return;
    }

    const route = getStudentMoreSystemRoute(item.id);
    if (route) {
      navigateStudentPortal(route);
      return;
    }

    toast.show(`${item.label} coming soon`, 'info');
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <StudentMoreHeroBanner title={data.heroTitle} description={data.heroDescription} />

        <StudentMoreModuleGrid
          title={data.academicSectionTitle}
          tiles={data.academicTiles}
          variant="academic"
          onTilePress={handleTilePress}
        />

        <StudentMoreModuleGrid
          title={data.campusSectionTitle}
          tiles={data.campusTiles}
          variant="campus"
          onTilePress={handleTilePress}
        />

        <StudentMoreSystemList
          title={data.systemSectionTitle}
          items={data.systemItems}
          onItemPress={handleSystemPress}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing['4xl'],
    gap: spacing['2xl'],
  },
});
