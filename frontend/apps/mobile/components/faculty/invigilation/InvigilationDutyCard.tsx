import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Bot, Calendar } from 'lucide-react-native';
import type { FacultyInvigilationDuty } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface InvigilationDutyCardProps {
  duty: FacultyInvigilationDuty;
}

function FieldBlock({
  label,
  children,
  alignEnd,
}: {
  label: string;
  children: ReactNode;
  alignEnd?: boolean;
}) {
  return (
    <View style={[styles.field, alignEnd && styles.fieldEnd]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

export function InvigilationDutyCard({ duty }: InvigilationDutyCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <FieldBlock label="Exam session">
          <Text style={styles.slotValue}>{duty.examSlot}</Text>
        </FieldBlock>
        <FieldBlock label="Assigned by" alignEnd>
          <View style={styles.assignedRow}>
            {duty.assignedByAuto ? (
              <Bot size={16} color={colors.primary} />
            ) : null}
            <Text style={styles.assignedValue}>{duty.assignedBy}</Text>
          </View>
        </FieldBlock>
      </View>
      <View style={styles.dividerSection}>
        <Text style={styles.fieldLabel}>Assigned on</Text>
        <View style={styles.dateRow}>
          <Calendar size={18} color={colors.textSecondary} />
          <Text style={styles.dateValue}>{duty.assignedAtLabel}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F3F4F5',
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    gap: spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  field: {
    flex: 1,
    gap: spacing.xs,
  },
  fieldEnd: {
    alignItems: 'flex-end',
  },
  fieldLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    letterSpacing: 0.2,
  },
  slotValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginTop: spacing.xs,
  },
  assignedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  assignedValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  dividerSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(191,201,196,0.3)',
    paddingTop: spacing.sm,
    gap: spacing.xs,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  dateValue: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
  },
});
