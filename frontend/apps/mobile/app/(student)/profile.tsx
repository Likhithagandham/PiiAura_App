import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAuth, useStudentProfile } from '@piiaura/hooks';
import { colors, spacing, typography } from '@piiaura/ui';
import { StudentProfileHero } from '@/components/student/profile/StudentProfileHero';
import { StudentProfilePersonalDetails } from '@/components/student/profile/StudentProfilePersonalDetails';
import { StudentProfileSecuritySection } from '@/components/student/profile/StudentProfileSecuritySection';
import { StudentProfileSaveFooter } from '@/components/student/profile/StudentProfileSaveFooter';
import { useToast } from '@/components/toast/ToastProvider';

export default function StudentProfileScreen() {
  const { data, isLoading } = useStudentProfile();
  const { user } = useAuth();
  const toast = useToast();
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [toggles, setToggles] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const initialFieldValues = useMemo(() => {
    if (!data) return {};
    const fromMock = Object.fromEntries(data.personalFields.map((field) => [field.id, field.value]));
    return {
      ...fromMock,
      'full-name': user?.name ?? fromMock['full-name'],
      email: user?.email ?? fromMock.email,
      'roll-number': user?.rollNumber ?? fromMock['roll-number'],
      'admission-number': user?.admissionNumber ?? fromMock['admission-number'],
      class: user?.className ?? fromMock.class,
    };
  }, [data, user]);

  const initialToggles = useMemo(() => {
    if (!data) return {};
    return Object.fromEntries(
      data.securityItems
        .filter((item) => item.type === 'toggle')
        .map((item) => [item.id, item.defaultEnabled ?? false]),
    );
  }, [data]);

  useEffect(() => {
    setFieldValues(initialFieldValues);
    setToggles(initialToggles);
  }, [initialFieldValues, initialToggles]);

  if (isLoading || !data) {
    return (
      <View style={styles.screen}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setSaving(false);
    setSaved(true);
    toast.show('Profile updated successfully', 'success');
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <StudentProfileHero
          name={fieldValues['full-name'] ?? data.name}
          rollLabel={`Roll No: ${fieldValues['roll-number'] ?? ''}`}
          programBadge={fieldValues.program ?? data.programBadge}
          avatarUrl={user?.avatarUrl ?? data.avatarUrl}
          onEditPhoto={() => toast.show('Photo upload coming soon', 'info')}
        />

        <StudentProfilePersonalDetails
          title={data.personalSectionTitle}
          fields={data.personalFields}
          values={fieldValues}
          onChange={(id, value) => setFieldValues((prev) => ({ ...prev, [id]: value }))}
        />

        <StudentProfileSecuritySection
          title={data.securitySectionTitle}
          items={data.securityItems}
          toggles={toggles}
          onToggle={(id, value) => setToggles((prev) => ({ ...prev, [id]: value }))}
          onAction={(id) => {
            if (id === 'password') {
              toast.show('Change password coming soon', 'info');
            }
          }}
        />

        <StudentProfileSaveFooter
          saveLabel={data.saveLabel}
          lastUpdatedLabel={data.lastUpdatedLabel}
          saving={saving}
          saved={saved}
          onSave={handleSave}
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
    gap: spacing.lg,
  },
});
