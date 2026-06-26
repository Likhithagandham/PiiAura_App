import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Briefcase, User } from 'lucide-react-native';
import { ROUTES } from '@piiaura/constants';
import { useAuth, useFacultyProfile } from '@piiaura/hooks';
import { colors, spacing, typography } from '@piiaura/ui';
import { ProfileHero } from '@/components/faculty/profile/ProfileHero';
import { ProfileInfoCard } from '@/components/faculty/profile/ProfileInfoCard';
import { ProfileAttendanceCard } from '@/components/faculty/profile/ProfileAttendanceCard';
import { ProfileSettingsSection } from '@/components/faculty/profile/ProfileSettingsSection';
import { useToast } from '@/components/toast/ToastProvider';

export default function FacultyProfileScreen() {
  const { data, isLoading } = useFacultyProfile();
  const { logout } = useAuth();
  const toast = useToast();

  const handleSettingPress = (id: string) => {
    if (id === 'password') {
      toast.show('Change password flow coming soon', 'info');
      return;
    }
    router.push(ROUTES.FACULTY.SETTINGS as never);
  };

  const handleLogout = () => {
    logout();
    router.replace(ROUTES.AUTH.LOGIN);
  };

  if (isLoading || !data) {
    return (
      <View style={styles.screen}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHero
          name={data.name}
          designation={data.designation}
          avatarUrl={data.avatarUrl}
          verified={data.verified}
          badges={data.badges}
        />

        <View style={styles.cards}>
          <ProfileInfoCard section={data.personalInfo} Icon={User} />
          <ProfileInfoCard section={data.workInfo} Icon={Briefcase} />
          <ProfileAttendanceCard attendance={data.attendance} />
          <ProfileSettingsSection
            sectionLabel={data.accountSettingsLabel}
            settings={data.settings}
            logoutLabel={data.logoutLabel}
            onSettingPress={handleSettingPress}
            onLogout={handleLogout}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
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
    paddingBottom: spacing['4xl'],
  },
  cards: {
    padding: spacing.lg,
    gap: spacing.md,
  },
});
