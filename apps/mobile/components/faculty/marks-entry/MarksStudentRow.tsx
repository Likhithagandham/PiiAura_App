import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { FacultyMarksEntryStudent } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface MarksStudentRowProps {
  student: FacultyMarksEntryStudent;
  maxMarks: number;
  value: string;
  onChange: (studentId: string, value: string) => void;
}

export function MarksStudentRow({ student, maxMarks, value, onChange }: MarksStudentRowProps) {
  const [focused, setFocused] = useState(false);
  const numericValue = value === '' ? null : Number(value);
  const isInvalid = numericValue !== null && (numericValue > maxMarks || numericValue < 0);
  const hasValue = numericValue !== null && numericValue > 0 && !isInvalid;

  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <View style={styles.indexBadge}>
          <Text style={styles.indexText}>{String(student.index).padStart(2, '0')}</Text>
        </View>
        <View>
          <Text style={styles.name}>{student.name}</Text>
          <Text style={styles.rollNo}>Roll No: {student.rollNo}</Text>
        </View>
      </View>
      <TextInput
        style={[
          styles.input,
          focused && styles.inputFocused,
          hasValue && styles.inputFilled,
          isInvalid && styles.inputInvalid,
        ]}
        placeholder="--"
        placeholderTextColor={colors.textMuted}
        value={value}
        onChangeText={(text) => onChange(student.id, text)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        keyboardType="number-pad"
        maxLength={3}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.xl,
    padding: spacing.md,
    gap: spacing.md,
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  indexBadge: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: '#7EBDAC',
  },
  name: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  rollNo: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  input: {
    width: 96,
    height: 48,
    borderWidth: 2,
    borderColor: colors.surfaceContainerHigh,
    borderRadius: radii.xl,
    backgroundColor: '#F3F4F5',
    textAlign: 'center',
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  inputFocused: {
    backgroundColor: colors.white,
    borderColor: colors.primary,
  },
  inputFilled: {
    backgroundColor: colors.white,
  },
  inputInvalid: {
    borderColor: colors.error,
    color: colors.error,
  },
});
