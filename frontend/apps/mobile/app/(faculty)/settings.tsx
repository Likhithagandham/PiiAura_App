import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import type { FacultyNotificationPreference, FacultyNotificationPreferenceId } from '@piiaura/types';
import { ROUTES } from '@piiaura/constants';
import { useFacultySettings } from '@piiaura/hooks';
import { colors, spacing, typography } from '@piiaura/ui';
import { SettingsProfileCard } from '@/components/faculty/settings/SettingsProfileCard';
import { NotificationPreferencesSection } from '@/components/faculty/settings/NotificationPreferencesSection';
import { PrivacyControlCard, SavePreferencesButton } from '@/components/faculty/settings/SettingsActions';
import { useToast } from '@/components/toast/ToastProvider';

export default function FacultySettingsScreen() {
  const { data, isLoading } = useFacultySettings();
  const toast = useToast();
  const [preferences, setPreferences] = useState<FacultyNotificationPreference[]>([]);

  useEffect(() => {
    if (data) {
      setPreferences(data.preferences);
    }
  }, [data]);

  const handleToggle = (id: FacultyNotificationPreferenceId, enabled: boolean) => {
    setPreferences((current) =>
      current.map((preference) =>
        preference.id === id ? { ...preference, enabled } : preference,
      ),
    );
  };

  const handleSave = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.show('Notification preferences saved', 'success');
  };

  const handleEdit = () => {
    toast.show('Edit profile photo coming soon', 'info');
  };

  const openProfile = () => {
    router.push(ROUTES.FACULTY.PROFILE as never);
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
        <SettingsProfileCard
          name={data.name}
          subtitle={data.subtitle}
          avatarUrl={data.avatarUrl}
          employeeIdLabel={data.employeeIdLabel}
          onEditPress={handleEdit}
          onPress={openProfile}
        />

        <NotificationPreferencesSection
          title={data.notificationsTitle}
          preferences={preferences}
          onToggle={handleToggle}
        />

        <SavePreferencesButton
          label={data.saveLabel}
          footnote={data.saveFootnote}
          onSave={handleSave}
        />

        <PrivacyControlCard
          title={data.privacyTitle}
          description={data.privacyDescription}
        />
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
    padding: spacing.lg,
    paddingBottom: spacing['4xl'],
    gap: spacing['2xl'],
  },
});
