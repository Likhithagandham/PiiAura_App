import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useFacultyMarksEntry } from '@piiaura/hooks';
import { colors, spacing, typography, radii } from '@piiaura/ui';
import { MarksEntryConfigForm } from '@/components/faculty/marks-entry/MarksEntryConfigForm';
import { MarksStudentRow } from '@/components/faculty/marks-entry/MarksStudentRow';
import { SaveMarksFab } from '@/components/faculty/marks-entry/SaveMarksFab';
import { useToast } from '@/components/toast/ToastProvider';

export default function FacultyMarksEntryScreen() {
  const { data, isLoading } = useFacultyMarksEntry();
  const toast = useToast();
  const [marksByStudent, setMarksByStudent] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const hasInvalidMarks = useMemo(() => {
    if (!data) return false;
    return Object.values(marksByStudent).some((value) => {
      if (value === '') return false;
      const num = Number(value);
      return Number.isNaN(num) || num < 0 || num > data.maxMarks;
    });
  }, [data, marksByStudent]);

  const handleMarksChange = (studentId: string, value: string) => {
    const sanitized = value.replace(/[^0-9]/g, '');
    setMarksByStudent((prev) => ({ ...prev, [studentId]: sanitized }));
  };

  const handleSave = async () => {
    if (hasInvalidMarks) {
      toast.show(`Marks must be between 0 and ${data?.maxMarks ?? 100}`, 'danger');
      return;
    }
    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.show('Marks saved successfully', 'success');
    } finally {
      setSaving(false);
    }
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
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.intro}>
          <Text style={styles.title}>{data.title}</Text>
          <Text style={styles.description}>{data.description}</Text>
        </View>

        <MarksEntryConfigForm
          classes={data.classes}
          subjects={data.subjects}
          examinations={data.examinations}
          defaultClass={data.defaultClass}
          defaultSubject={data.defaultSubject}
          defaultExamination={data.defaultExamination}
        />

        <View style={styles.listSection}>
          <View style={styles.listHeader}>
            <Text style={styles.enrolledLabel}>
              {data.enrolledCount} Students Enrolled
            </Text>
            <View style={styles.maxBadge}>
              <Text style={styles.maxBadgeText}>Max: {data.maxMarks}</Text>
            </View>
          </View>
          <View style={styles.list}>
            {data.students.map((student) => (
              <MarksStudentRow
                key={student.id}
                student={student}
                maxMarks={data.maxMarks}
                value={marksByStudent[student.id] ?? ''}
                onChange={handleMarksChange}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <SaveMarksFab
        label={data.saveLabel}
        onPress={handleSave}
        loading={saving}
        disabled={hasInvalidMarks}
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
    paddingBottom: 120,
    gap: spacing['2xl'],
  },
  intro: {
    gap: spacing.sm,
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
    gap: spacing.md,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
  },
  enrolledLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.textSecondary,
  },
  maxBadge: {
    backgroundColor: colors.surfaceContainerHigh,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  maxBadgeText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  list: {
    gap: spacing.md,
  },
});
