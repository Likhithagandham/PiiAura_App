import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import type { StudentLearnMainTab } from '@piiaura/types';
import { useStudentLearn } from '@piiaura/hooks';
import { colors, spacing, typography } from '@piiaura/ui';
import { StudentLearnTabs } from '@/components/student/learn/StudentLearnTabs';
import { StudentLearnSearchBar } from '@/components/student/learn/StudentLearnSearchBar';
import { StudentLearnCategoryChips } from '@/components/student/learn/StudentLearnCategoryChips';
import { StudentLearnHeroCard } from '@/components/student/learn/StudentLearnHeroCard';
import { StudentLearnMaterialList } from '@/components/student/learn/StudentLearnMaterialList';
import { StudentLearnUploadAssignmentCard } from '@/components/student/learn/StudentLearnUploadAssignmentCard';
import { StudentLearnFab } from '@/components/student/learn/StudentLearnFab';
import { useToast } from '@/components/toast/ToastProvider';

const ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;

export default function StudentLearnScreen() {
  const { data, isLoading } = useStudentLearn();
  const toast = useToast();
  const [mainTab, setMainTab] = useState<StudentLearnMainTab>('study');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<Record<string, string>>({});

  if (isLoading || !data) {
    return (
      <View style={styles.screen}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading learn hub...</Text>
        </View>
      </View>
    );
  }

  const activeCategoryId = selectedCategoryId ?? data.selectedCategoryId;

  const handlePickFile = async (assignmentId: string) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [...ACCEPTED_MIME_TYPES],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) return;

      const asset = result.assets?.[0];
      if (!asset?.name) {
        toast.show('Could not read the selected file. Please try again.', 'danger');
        return;
      }

      setSelectedFiles((current) => ({ ...current, [assignmentId]: asset.name }));
    } catch {
      toast.show('Unable to open the file picker. Please try again.', 'danger');
    }
  };

  const handleUpload = (assignmentId: string) => {
    const fileName = selectedFiles[assignmentId];
    if (!fileName) {
      toast.show('Select a file before uploading', 'info');
      return;
    }
    toast.show(`Uploaded ${fileName} to mock S3`, 'success');
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
      >
        <View style={styles.stickyHeader}>
          <StudentLearnTabs
            active={mainTab}
            studyLabel={data.studyTabLabel}
            assignmentsLabel={data.assignmentsTabLabel}
            onChange={setMainTab}
          />
          {mainTab === 'study' ? (
            <View style={styles.searchWrap}>
              <StudentLearnSearchBar
                placeholder={data.searchPlaceholder}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          ) : null}
        </View>

        {mainTab === 'study' ? (
          <View style={styles.section}>
            <StudentLearnCategoryChips
              categories={data.categories}
              selectedId={activeCategoryId}
              onSelect={setSelectedCategoryId}
            />
            <StudentLearnHeroCard
              material={data.heroMaterial}
              onPlay={() => toast.show('Video player coming soon', 'info')}
            />
            <StudentLearnMaterialList
              title={data.recentMaterialsTitle}
              viewAllLabel={data.viewAllLabel}
              materials={data.recentMaterials}
              onViewAll={() => toast.show('All materials coming soon', 'info')}
              onDownload={() => toast.show('Download started', 'success')}
            />
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.assignmentsDescription}>{data.assignmentsDescription}</Text>
            <View style={styles.assignmentsList}>
              {data.uploadAssignments.map((assignment) => (
                <StudentLearnUploadAssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  selectedFileName={selectedFiles[assignment.id]}
                  onPickFile={() => handlePickFile(assignment.id)}
                  onClearFile={() =>
                    setSelectedFiles((current) => {
                      const next = { ...current };
                      delete next[assignment.id];
                      return next;
                    })
                  }
                  onUpload={() => handleUpload(assignment.id)}
                  onViewSubmission={() => toast.show('Opening submission...', 'info')}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {mainTab === 'study' ? (
        <StudentLearnFab onPress={() => toast.show('Upload material coming soon', 'info')} />
      ) : null}
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
    paddingBottom: spacing['4xl'],
  },
  stickyHeader: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.lg,
  },
  searchWrap: {
    paddingTop: spacing.xs,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing['2xl'],
  },
  assignmentsDescription: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    paddingHorizontal: spacing.xs,
  },
  assignmentsList: {
    gap: spacing.md,
  },
});
