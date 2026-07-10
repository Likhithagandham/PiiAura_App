import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';
import { colors, spacing, typography, radii } from '@piiaura/ui';

type PickerField = 'class' | 'subject' | 'examination' | null;

interface MarksEntryConfigFormProps {
  classes: string[];
  subjects: string[];
  examinations: string[];
  defaultClass: string;
  defaultSubject: string;
  defaultExamination: string;
  onChange?: (values: { className: string; subject: string; examination: string }) => void;
}

function FieldLabel({ children }: { children: string }) {
  return <Text style={styles.label}>{children}</Text>;
}

export function MarksEntryConfigForm({
  classes,
  subjects,
  examinations,
  defaultClass,
  defaultSubject,
  defaultExamination,
  onChange,
}: MarksEntryConfigFormProps) {
  const [className, setClassName] = useState(defaultClass);
  const [subject, setSubject] = useState(defaultSubject);
  const [examination, setExamination] = useState(defaultExamination);
  const [pickerField, setPickerField] = useState<PickerField>(null);

  const pickerOptions =
    pickerField === 'class'
      ? classes
      : pickerField === 'subject'
        ? subjects
        : examinations;

  const pickerValue =
    pickerField === 'class'
      ? className
      : pickerField === 'subject'
        ? subject
        : examination;

  const pickerTitle =
    pickerField === 'class'
      ? 'Class'
      : pickerField === 'subject'
        ? 'Subject'
        : 'Examination';

  const updateValues = (
    next: Partial<{ className: string; subject: string; examination: string }>,
  ) => {
    const values = {
      className: next.className ?? className,
      subject: next.subject ?? subject,
      examination: next.examination ?? examination,
    };
    onChange?.(values);
  };

  const handleSelect = (value: string) => {
    if (pickerField === 'class') {
      setClassName(value);
      updateValues({ className: value });
    } else if (pickerField === 'subject') {
      setSubject(value);
      updateValues({ subject: value });
    } else {
      setExamination(value);
      updateValues({ examination: value });
    }
    setPickerField(null);
  };

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={[styles.field, styles.halfField]}>
          <FieldLabel>Class</FieldLabel>
          <Pressable style={styles.select} onPress={() => setPickerField('class')}>
            <Text style={styles.selectText} numberOfLines={1}>
              {className}
            </Text>
            <ChevronDown size={18} color={colors.textSecondary} />
          </Pressable>
        </View>
        <View style={[styles.field, styles.halfField]}>
          <FieldLabel>Subject</FieldLabel>
          <Pressable style={styles.select} onPress={() => setPickerField('subject')}>
            <Text style={styles.selectText} numberOfLines={1}>
              {subject}
            </Text>
            <ChevronDown size={18} color={colors.textSecondary} />
          </Pressable>
        </View>
      </View>

      <View style={styles.field}>
        <FieldLabel>Examination</FieldLabel>
        <Pressable style={styles.select} onPress={() => setPickerField('examination')}>
          <Text style={styles.selectText} numberOfLines={1}>
            {examination}
          </Text>
          <ChevronDown size={18} color={colors.textSecondary} />
        </Pressable>
      </View>

      <Modal visible={pickerField !== null} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setPickerField(null)}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{pickerTitle}</Text>
            <ScrollView>
              {pickerOptions.map((option) => (
                <Pressable
                  key={option}
                  style={styles.modalOption}
                  onPress={() => handleSelect(option)}
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
    backgroundColor: '#F3F4F5',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  field: {
    gap: 6,
  },
  halfField: {
    flex: 1,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    paddingHorizontal: spacing.xs,
  },
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.xl,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    minHeight: 44,
  },
  selectText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    flex: 1,
    paddingVertical: spacing.md,
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
