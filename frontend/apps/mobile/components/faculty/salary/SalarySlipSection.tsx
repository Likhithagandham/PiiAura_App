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
import type { FacultySalaryMonthOption, FacultySalaryPayrollError } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';
import { PayrollNotProcessed } from './PayrollNotProcessed';

interface SalarySlipSectionProps {
  title: string;
  historyLabel: string;
  monthLabel: string;
  months: FacultySalaryMonthOption[];
  defaultMonthId: string;
  payrollError: FacultySalaryPayrollError;
  onHistory?: () => void;
  onNotify?: () => void;
}

export function SalarySlipSection({
  title,
  historyLabel,
  monthLabel,
  months,
  defaultMonthId,
  payrollError,
  onHistory,
  onNotify,
}: SalarySlipSectionProps) {
  const [selectedMonthId, setSelectedMonthId] = useState(defaultMonthId);
  const [pickerOpen, setPickerOpen] = useState(false);

  const selectedMonth =
    months.find((month) => month.id === selectedMonthId) ?? months[0];
  const description = payrollError.descriptionTemplate.replace(
    '{month}',
    selectedMonth?.label ?? '',
  );

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Pressable style={styles.historyBtn} onPress={onHistory}>
          <Text style={styles.historyText}>{historyLabel}</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <View style={styles.field}>
          <Text style={styles.label}>{monthLabel}</Text>
          <Pressable style={styles.select} onPress={() => setPickerOpen(true)}>
            <Text style={styles.selectText}>{selectedMonth?.label}</Text>
            <ChevronDown size={18} color={colors.textSecondary} />
          </Pressable>
        </View>

        <PayrollNotProcessed
          title={payrollError.title}
          description={description}
          notifyLabel={payrollError.notifyLabel}
          onNotify={onNotify}
        />
      </View>

      <Modal visible={pickerOpen} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setPickerOpen(false)}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{monthLabel}</Text>
            <ScrollView>
              {months.map((month) => (
                <Pressable
                  key={month.id}
                  style={styles.modalOption}
                  onPress={() => {
                    setSelectedMonthId(month.id);
                    setPickerOpen(false);
                  }}
                >
                  <Text style={styles.modalOptionText}>{month.label}</Text>
                  {selectedMonthId === month.id ? (
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
  section: {
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  historyBtn: {
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
  },
  historyText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
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
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 44,
  },
  selectText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    flex: 1,
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
