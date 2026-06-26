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
import { ChevronDown, Check, Timer } from 'lucide-react-native';
import type { FacultyAiDifficulty } from '@piiaura/types';
import { Button, colors, spacing, typography, radii } from '@piiaura/ui';
import { QuizDifficultySegment } from './QuizDifficultySegment';

type PickerField = 'subject' | 'timer' | null;

interface TopicQuizFormProps {
  subjects: string[];
  defaultSubject: string;
  defaultQuestionCount: string;
  timerOptions: string[];
  defaultTimer: string;
  defaultDifficulty: FacultyAiDifficulty;
  onGenerate: (payload: {
    subject: string;
    topic: string;
    questionCount: string;
    timer: string;
    difficulty: FacultyAiDifficulty;
  }) => Promise<void>;
}

function FieldLabel({ children }: { children: string }) {
  return <Text style={styles.label}>{children}</Text>;
}

export function TopicQuizForm({
  subjects,
  defaultSubject,
  defaultQuestionCount,
  timerOptions,
  defaultTimer,
  defaultDifficulty,
  onGenerate,
}: TopicQuizFormProps) {
  const [subject, setSubject] = useState(defaultSubject);
  const [topic, setTopic] = useState('');
  const [questionCount, setQuestionCount] = useState(defaultQuestionCount);
  const [timer, setTimer] = useState(defaultTimer);
  const [difficulty, setDifficulty] = useState<FacultyAiDifficulty>(defaultDifficulty);
  const [pickerField, setPickerField] = useState<PickerField>(null);
  const [generating, setGenerating] = useState(false);

  const pickerOptions = pickerField === 'subject' ? subjects : timerOptions;
  const pickerValue = pickerField === 'subject' ? subject : timer;
  const pickerTitle = pickerField === 'subject' ? 'Subject' : 'Timer (Optional)';

  const handlePickerSelect = (value: string) => {
    if (pickerField === 'subject') setSubject(value);
    else setTimer(value);
    setPickerField(null);
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setGenerating(true);
    try {
      await onGenerate({ subject, topic, questionCount, timer, difficulty });
      setTopic('');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.form}>
        <View style={styles.field}>
          <FieldLabel>Subject</FieldLabel>
          <Pressable style={styles.select} onPress={() => setPickerField('subject')}>
            <Text style={styles.selectText}>{subject}</Text>
            <ChevronDown size={18} color={colors.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.field}>
          <FieldLabel>Topic / Chapter</FieldLabel>
          <TextInput
            style={styles.input}
            placeholder="e.g., Linear Algebra or Eigenvalues"
            placeholderTextColor={colors.textMuted}
            value={topic}
            onChangeText={setTopic}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.field, styles.halfField]}>
            <FieldLabel>No. of Questions</FieldLabel>
            <TextInput
              style={styles.input}
              value={questionCount}
              onChangeText={setQuestionCount}
              keyboardType="number-pad"
            />
          </View>
          <View style={[styles.field, styles.halfField]}>
            <FieldLabel>Timer (Optional)</FieldLabel>
            <Pressable style={styles.select} onPress={() => setPickerField('timer')}>
              <Text style={styles.selectText}>{timer}</Text>
              <Timer size={18} color={colors.textSecondary} />
            </Pressable>
          </View>
        </View>

        <View style={styles.field}>
          <FieldLabel>Difficulty Level</FieldLabel>
          <QuizDifficultySegment value={difficulty} onChange={setDifficulty} />
        </View>
      </View>

      <Button
        label="Generate Quiz"
        onPress={handleGenerate}
        loading={generating}
        disabled={generating || !topic.trim()}
        style={styles.generateBtn}
      />

      <Modal visible={pickerField !== null} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setPickerField(null)}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{pickerTitle}</Text>
            <ScrollView>
              {pickerOptions.map((option) => (
                <Pressable
                  key={option}
                  style={styles.modalOption}
                  onPress={() => handlePickerSelect(option)}
                >
                  <Text style={styles.modalOptionText}>{option}</Text>
                  {pickerValue === option ? (
                    <Check size={18} color={colors.primary} />
                  ) : null}
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
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  form: {
    gap: spacing.lg,
  },
  field: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  halfField: {
    flex: 1,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    letterSpacing: 0.3,
    marginLeft: spacing.xs,
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
  generateBtn: {
    borderRadius: radii.xl,
    minHeight: 56,
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
