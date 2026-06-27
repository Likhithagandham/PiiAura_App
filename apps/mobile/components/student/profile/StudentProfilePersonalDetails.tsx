import { View, Text, StyleSheet, TextInput } from 'react-native';
import type { StudentProfilePersonalField } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface StudentProfilePersonalDetailsProps {
  title: string;
  fields: StudentProfilePersonalField[];
  values: Record<string, string>;
  onChange: (id: string, value: string) => void;
}

export function StudentProfilePersonalDetails({
  title,
  fields,
  values,
  onChange,
}: StudentProfilePersonalDetailsProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
      <View style={styles.body}>
        {fields.map((field) => (
          <View key={field.id} style={styles.field}>
            <Text style={styles.label}>{field.label}</Text>
            <TextInput
              style={styles.input}
              value={values[field.id] ?? field.value}
              onChangeText={(text) => onChange(field.id, text)}
              keyboardType={
                field.inputType === 'email'
                  ? 'email-address'
                  : field.inputType === 'tel'
                    ? 'phone-pad'
                    : 'default'
              }
              autoCapitalize={field.inputType === 'email' ? 'none' : 'words'}
              placeholderTextColor={colors.textMuted}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.xl,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: '#F3F4F5',
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  headerTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  body: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
});
