import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { WALKTHROUGH_TARGETS } from '@piiaura/constants';
import { useFacultySyllabus } from '@piiaura/hooks';
import type { FacultySyllabusSubject } from '@piiaura/types';
import { colors, spacing, typography } from '@piiaura/ui';
import { SyllabusFocusCard } from '@/components/faculty/syllabus/SyllabusFocusCard';
import { SyllabusSubjectCard } from '@/components/faculty/syllabus/SyllabusSubjectCard';
import { SyllabusSubjectDetailModal } from '@/components/faculty/syllabus/SyllabusSubjectDetailModal';
import { AddSubjectButton } from '@/components/faculty/syllabus/AddSubjectButton';
import { AddSubjectModal } from '@/components/faculty/syllabus/AddSubjectModal';
import { useToast } from '@/components/toast/ToastProvider';
import { WalkthroughTarget, useModuleWalkthrough } from '@/components/walkthrough/WalkthroughProvider';

function createSubject(payload: { name: string; classLabel: string }): FacultySyllabusSubject {
  return {
    id: `syll-${payload.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
    name: payload.name,
    classLabel: payload.classLabel,
    percent: 0,
    status: 'on-track',
    statusLabel: 'On Track',
    lastUpdatedLabel: 'Added just now',
    chapters: [
      { id: 'new-1', title: 'Unit 1', status: 'upcoming' },
      { id: 'new-2', title: 'Unit 2', status: 'upcoming' },
      { id: 'new-3', title: 'Unit 3', status: 'upcoming' },
    ],
  };
}

export default function FacultySyllabusScreen() {
  useModuleWalkthrough('syllabus');
  const { data, isLoading } = useFacultySyllabus();
  const toast = useToast();
  const [subjects, setSubjects] = useState<FacultySyllabusSubject[]>([]);
  const [detailSubject, setDetailSubject] = useState<FacultySyllabusSubject | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  useEffect(() => {
    if (data) {
      setSubjects(data.subjects);
    }
  }, [data]);

  const handleUpdateTopics = () => {
    toast.show('Topic editor coming soon', 'info');
  };

  const handleAddSubject = (payload: { name: string; classLabel: string }) => {
    const exists = subjects.some(
      (subject) => subject.name === payload.name && subject.classLabel === payload.classLabel,
    );
    if (exists) {
      toast.show('This subject is already in your list', 'danger');
      return;
    }
    const nextSubject = createSubject(payload);
    setSubjects((current) => [...current, nextSubject]);
    toast.show(`${payload.name} added to your syllabus`, 'success');
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
        <WalkthroughTarget id={WALKTHROUGH_TARGETS.FACULTY.SYLLABUS_INTRO} style={styles.intro}>
          <Text style={styles.title}>{data.title}</Text>
          <Text style={styles.description}>{data.description}</Text>
        </WalkthroughTarget>

        <WalkthroughTarget id={WALKTHROUGH_TARGETS.FACULTY.SYLLABUS_FOCUS}>
          <SyllabusFocusCard focus={data.currentFocus} onUpdateTopics={handleUpdateTopics} />
        </WalkthroughTarget>

        <WalkthroughTarget id={WALKTHROUGH_TARGETS.FACULTY.SYLLABUS_LIST} style={styles.listSection}>
          <Text style={styles.sectionLabel}>{data.otherSubjectsLabel}</Text>
          <View style={styles.list}>
            {subjects.map((subject) => (
              <SyllabusSubjectCard
                key={subject.id}
                subject={subject}
                onDetails={setDetailSubject}
              />
            ))}
          </View>
        </WalkthroughTarget>

        <WalkthroughTarget id={WALKTHROUGH_TARGETS.FACULTY.SYLLABUS_ADD}>
          <AddSubjectButton
            label={data.addSubjectLabel}
            onPress={() => setAddModalOpen(true)}
          />
        </WalkthroughTarget>
      </ScrollView>

      <SyllabusSubjectDetailModal
        subject={detailSubject}
        visible={detailSubject !== null}
        onClose={() => setDetailSubject(null)}
      />

      <AddSubjectModal
        visible={addModalOpen}
        options={data.addSubjectOptions}
        onClose={() => setAddModalOpen(false)}
        onAdd={handleAddSubject}
      />
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
  listSection: {
    gap: spacing.lg,
  },
  sectionLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    paddingHorizontal: spacing.xs,
  },
  list: {
    gap: spacing.lg,
  },
});
