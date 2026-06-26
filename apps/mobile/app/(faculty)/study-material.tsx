import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useFacultyStudyMaterial } from '@piiaura/hooks';
import { colors, spacing, typography } from '@piiaura/ui';
import { StudyMaterialUploadForm } from '@/components/faculty/study-material/StudyMaterialUploadForm';
import { StudyMaterialEmptyState } from '@/components/faculty/study-material/StudyMaterialEmptyState';
import { StudyMaterialTips } from '@/components/faculty/study-material/StudyMaterialTips';
import { useToast } from '@/components/toast/ToastProvider';

export default function FacultyStudyMaterialScreen() {
  const { data, isLoading } = useFacultyStudyMaterial();
  const toast = useToast();

  const handleUpload = async (_payload: {
    session: string;
    date: string;
    fileName: string;
    fileUri: string;
  }) => {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    toast.show('Study material uploaded successfully', 'success');
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
        <View style={styles.intro}>
          <Text style={styles.title}>{data.title}</Text>
          <Text style={styles.description}>{data.description}</Text>
        </View>

        <StudyMaterialUploadForm
          sessions={data.sessions}
          defaultSession={data.defaultSession}
          onUpload={handleUpload}
          onPickError={(message) => toast.show(message, 'danger')}
        />

        <View style={styles.uploadsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Uploads</Text>
            <Pressable>
              <Text style={styles.viewAll}>View All</Text>
            </Pressable>
          </View>
          <StudyMaterialEmptyState
            title={data.emptyUploadsTitle}
            description={data.emptyUploadsDescription}
          />
        </View>

        <StudyMaterialTips tips={data.tips} />
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
    gap: spacing['2xl'],
    paddingBottom: spacing['4xl'],
  },
  intro: {
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  uploadsSection: {
    gap: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  viewAll: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
});
