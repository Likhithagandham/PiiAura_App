import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';
import type { FacultyAiDifficulty, FacultyAiQuestionType } from '@piiaura/types';
import { Button, colors, spacing, typography, radii } from '@piiaura/ui';
import { DifficultyChips } from './DifficultyChips';
import { QuestionTypeOption } from './QuestionTypeOption';

interface QuestionPaperFormProps {
  subjects: string[];
  defaultSubject: string;
  defaultDifficulty: FacultyAiDifficulty;
  questionTypes: FacultyAiQuestionType[];
  onGenerate: (payload: {
    subject: string;
    unit: string;
    totalMarks: string;
    difficulty: FacultyAiDifficulty;
    questionTypeIds: string[];
  }) => Promise<void>;
}

function FieldLabel({ children }: { children: string }) {
  return <Text style={styles.label}>{children}</Text>;
}

export function QuestionPaperForm({
  subjects,
  defaultSubject,
  defaultDifficulty,
  questionTypes,
  onGenerate,
}: QuestionPaperFormProps) {
  const [subject, setSubject] = useState(defaultSubject);
  const [unit, setUnit] = useState('');
  const [totalMarks, setTotalMarks] = useState('');
  const [difficulty, setDifficulty] = useState<FacultyAiDifficulty>(defaultDifficulty);
  const [checkedTypes, setCheckedTypes] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(questionTypes.map((type) => [type.id, type.defaultChecked])),
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [generating, setGenerating] = useState(false);

  const toggleType = (id: string) => {
    setCheckedTypes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleGenerate = async () => {
    const selectedIds = questionTypes
      .filter((type) => checkedTypes[type.id])
      .map((type) => type.id);
    if (selectedIds.length === 0) return;

    setGenerating(true);
    try {
      await onGenerate({
        subject,
        unit,
        totalMarks,
        difficulty,
        questionTypeIds: selectedIds,
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.form}>
        <View style={styles.field}>
          <FieldLabel>Subject</FieldLabel>
          <Pressable style={styles.select} onPress={() => setPickerOpen(true)}>
            <Text style={styles.selectText}>{subject}</Text>
            <ChevronDown size={18} color={colors.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.row}>
          <View style={[styles.field, styles.halfField]}>
            <FieldLabel>Unit / Chapter</FieldLabel>
            <TextInput
              style={styles.input}
              placeholder="e.g. Calculus"
              placeholderTextColor={colors.textMuted}
              value={unit}
              onChangeText={setUnit}
            />
          </View>
          <View style={[styles.field, styles.halfField]}>
            <FieldLabel>Total Marks</FieldLabel>
            <TextInput
              style={styles.input}
              placeholder="100"
              placeholderTextColor={colors.textMuted}
              value={totalMarks}
              onChangeText={setTotalMarks}
              keyboardType="number-pad"
            />
          </View>
        </View>

        <View style={styles.field}>
          <FieldLabel>Difficulty Level</FieldLabel>
          <DifficultyChips value={difficulty} onChange={setDifficulty} />
        </View>

        <View style={styles.field}>
          <FieldLabel>Question Types</FieldLabel>
          <View style={styles.typeList}>
            {questionTypes.map((type) => (
              <QuestionTypeOption
                key={type.id}
                option={type}
                checked={!!checkedTypes[type.id]}
                onToggle={() => toggleType(type.id)}
              />
            ))}
          </View>
        </View>
      </View>

      <Button
        label="Generate Paper"
        onPress={handleGenerate}
        loading={generating}
        disabled={generating || !Object.values(checkedTypes).some(Boolean)}
        style={styles.generateBtn}
      />

      <Modal visible={pickerOpen} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setPickerOpen(false)}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Subject</Text>
            <ScrollView>
              {subjects.map((option) => (
                <Pressable
                  key={option}
                  style={styles.modalOption}
                  onPress={() => {
                    setSubject(option);
                    setPickerOpen(false);
                  }}
                >
                  <Text style={styles.modalOptionText}>{option}</Text>
                  {subject === option ? <Check size={18} color={colors.primary} /> : null}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  form: {
    gap: spacing.lg,
  },
  field: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfField: {
    flex: 1,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    letterSpacing: 0.3,
    paddingHorizontal: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.text,
    minHeight: 48,
  },
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 48,
  },
  selectText: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    flex: 1,
  },
  typeList: {
    gap: spacing.sm,
  },
  generateBtn: {
    borderRadius: radii.xl,
    minHeight: 52,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.lg,
    maxHeight: '40%',
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modalOptionText: {
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
});
