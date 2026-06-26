import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Check, ChevronDown, X } from 'lucide-react-native';
import type { FacultySyllabusAddOptions } from '@piiaura/types';
import { Button, colors, spacing, typography, radii } from '@piiaura/ui';

interface AddSubjectModalProps {
  visible: boolean;
  options: FacultySyllabusAddOptions;
  onClose: () => void;
  onAdd: (payload: { name: string; classLabel: string }) => void;
}

type PickerField = 'subject' | 'class' | null;

function FieldLabel({ children }: { children: string }) {
  return <Text style={styles.label}>{children}</Text>;
}

export function AddSubjectModal({ visible, options, onClose, onAdd }: AddSubjectModalProps) {
  const [subjectName, setSubjectName] = useState(options.subjectNames[0] ?? '');
  const [classLabel, setClassLabel] = useState(options.classLabels[0] ?? '');
  const [pickerField, setPickerField] = useState<PickerField>(null);

  const pickerOptions = pickerField === 'subject' ? options.subjectNames : options.classLabels;
  const pickerValue = pickerField === 'subject' ? subjectName : classLabel;
  const pickerTitle = pickerField === 'subject' ? 'Subject' : 'Class';

  const handleSelect = (value: string) => {
    if (pickerField === 'subject') setSubjectName(value);
    else setClassLabel(value);
    setPickerField(null);
  };

  const handleAdd = () => {
    if (!subjectName || !classLabel) return;
    onAdd({ name: subjectName, classLabel });
    onClose();
  };

  const handleClose = () => {
    setPickerField(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      accessibilityViewIsModal
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={handleClose} accessibilityLabel="Close" />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>Add subject</Text>
            <Pressable
              onPress={handleClose}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <X size={20} color={colors.textSecondary} />
            </Pressable>
          </View>
          <Text style={styles.description}>
            Track syllabus completion for another class you teach.
          </Text>

          <View style={styles.form}>
            <View style={styles.field}>
              <FieldLabel>Subject</FieldLabel>
              <Pressable
                style={styles.select}
                onPress={() => setPickerField('subject')}
                accessibilityRole="button"
                accessibilityLabel={`Subject, ${subjectName}`}
              >
                <Text style={styles.selectText}>{subjectName}</Text>
                <ChevronDown size={18} color={colors.textSecondary} />
              </Pressable>
            </View>
            <View style={styles.field}>
              <FieldLabel>Class</FieldLabel>
              <Pressable
                style={styles.select}
                onPress={() => setPickerField('class')}
                accessibilityRole="button"
                accessibilityLabel={`Class, ${classLabel}`}
              >
                <Text style={styles.selectText}>{classLabel}</Text>
                <ChevronDown size={18} color={colors.textSecondary} />
              </Pressable>
            </View>
          </View>

          <Button label="Add subject" onPress={handleAdd} fullWidth />

          <Modal visible={pickerField !== null} transparent animationType="fade">
            <Pressable style={styles.pickerOverlay} onPress={() => setPickerField(null)}>
              <View style={styles.pickerSheet}>
                <Text style={styles.pickerTitle}>{pickerTitle}</Text>
                <ScrollView>
                  {pickerOptions.map((option) => (
                    <Pressable
                      key={option}
                      style={styles.pickerOption}
                      onPress={() => handleSelect(option)}
                    >
                      <Text style={styles.pickerOptionText}>{option}</Text>
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
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radii.full,
    backgroundColor: colors.outlineVariant,
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  closeBtn: {
    padding: spacing.sm,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  form: {
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
  },
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 48,
  },
  selectText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    flex: 1,
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.lg,
    maxHeight: '40%',
  },
  pickerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  pickerOptionText: {
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
});
