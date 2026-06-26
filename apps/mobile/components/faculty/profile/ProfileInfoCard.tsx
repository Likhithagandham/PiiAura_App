import { View, Text, StyleSheet } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import type { FacultyProfileInfoSection } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface ProfileInfoCardProps {
  section: FacultyProfileInfoSection;
  Icon: LucideIcon;
}

export function ProfileInfoCard({ section, Icon }: ProfileInfoCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Icon size={20} color={colors.primary} />
        <Text style={styles.title}>{section.title}</Text>
      </View>

      <View style={styles.grid}>
        {section.fields.map((field) => (
          <View key={field.label} style={styles.field}>
            <Text style={styles.label}>{field.label}</Text>
            <Text style={[styles.value, field.emphasized && styles.valueEmphasized]}>{field.value}</Text>
          </View>
        ))}
      </View>
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  field: {
    width: '47%',
    flexGrow: 1,
    gap: spacing.xs,
  },
  label: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  value: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  valueEmphasized: {
    fontWeight: typography.fontWeight.bold,
    letterSpacing: -0.2,
  },
});
