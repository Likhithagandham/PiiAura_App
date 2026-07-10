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
import { CalendarDays, ChevronDown, Check } from 'lucide-react-native';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface StudentLeaveRequestFormProps {
  leaveTypes: string[];
  submitLabel: string;
  onSubmit: (payload: {
    leaveType: string;
    fromDate: string;
    toDate: string;
    reason: string;
  }) => Promise<void>;
}

function FieldLabel({ children }: { children: string }) {
  return <Text style={styles.label}>{children}</Text>;
}

export function StudentLeaveRequestForm({
  leaveTypes,
  submitLabel,
  onSubmit,
}: StudentLeaveRequestFormProps) {
  const [leaveType, setLeaveType] = useState(leaveTypes[0] ?? 'Casual Leave');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit({ leaveType, fromDate, toDate, reason });
      setFromDate('');
      setToDate('');
      setReason('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <CalendarDays size={20} color={colors.primary} />
        <Text style={styles.cardTitle}>Apply for Leave</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.dateRow}>
          <View style={[styles.field, styles.dateField]}>
            <FieldLabel>From Date</FieldLabel>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textMuted}
              value={fromDate}
              onChangeText={setFromDate}
            />
          </View>
          <View style={[styles.field, styles.dateField]}>
            <FieldLabel>To Date</FieldLabel>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textMuted}
              value={toDate}
              onChangeText={setToDate}
            />
          </View>
        </View>

        <View style={styles.field}>
          <FieldLabel>Leave Type</FieldLabel>
          <Pressable style={styles.select} onPress={() => setPickerOpen(true)}>
            <Text style={styles.selectText}>{leaveType}</Text>
            <ChevronDown size={18} color={colors.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.field}>
          <FieldLabel>Reason</FieldLabel>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Briefly explain your reason for leave..."
            placeholderTextColor={colors.textMuted}
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <Pressable
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.submitBtnText}>{submitting ? 'Submitting...' : submitLabel}</Text>
        </Pressable>
      </View>

      <Modal visible={pickerOpen} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setPickerOpen(false)}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Leave Type</Text>
            <ScrollView>
              {leaveTypes.map((type) => (
                <Pressable
                  key={type}
                  style={styles.modalOption}
                  onPress={() => {
                    setLeaveType(type);
                    setPickerOpen(false);
                  }}
                >
                  <Text style={styles.modalOptionText}>{type}</Text>
                  {leaveType === type ? <Check size={18} color={colors.primary} /> : null}
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
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.xl,
    padding: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  form: {
    gap: spacing.lg,
  },
  field: {
    gap: spacing.xs,
  },
  dateRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dateField: {
    flex: 1,
  },
  label: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginLeft: 4,
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
  textarea: {
    minHeight: 88,
    paddingTop: spacing.md,
  },
  submitBtn: {
    backgroundColor: '#00342B',
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
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
    maxHeight: '50%',
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
