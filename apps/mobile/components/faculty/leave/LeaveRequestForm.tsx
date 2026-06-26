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
import { FileEdit, ChevronDown, Check } from 'lucide-react-native';
import { Button, colors, spacing, typography, radii } from '@piiaura/ui';

interface LeaveRequestFormProps {
  leaveTypes: string[];
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

export function LeaveRequestForm({ leaveTypes, onSubmit }: LeaveRequestFormProps) {
  const [leaveType, setLeaveType] = useState(leaveTypes[0] ?? 'Annual Leave');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit({ leaveType, fromDate, toDate, reason });
      setSubmitted(true);
      setFromDate('');
      setToDate('');
      setReason('');
      setTimeout(() => setSubmitted(false), 2000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <FileEdit size={20} color={colors.primary} />
        <Text style={styles.cardTitle}>Apply for Leave</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.field}>
          <FieldLabel>Leave Type</FieldLabel>
          <Pressable style={styles.select} onPress={() => setPickerOpen(true)}>
            <Text style={styles.selectText}>{leaveType}</Text>
            <ChevronDown size={18} color={colors.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.dateRow}>
          <View style={[styles.field, styles.dateField]}>
            <FieldLabel>From</FieldLabel>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textMuted}
              value={fromDate}
              onChangeText={setFromDate}
            />
          </View>
          <View style={[styles.field, styles.dateField]}>
            <FieldLabel>To</FieldLabel>
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
          <FieldLabel>Reason for Absence</FieldLabel>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Explain your reason briefly..."
            placeholderTextColor={colors.textMuted}
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <Button
          label={submitted ? 'Sent Successfully' : 'Submit Request'}
          onPress={handleSubmit}
          loading={submitting}
          disabled={submitting || submitted}
          fullWidth
          style={submitted ? styles.successBtn : undefined}
        />
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
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.xl,
    padding: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
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
    color: colors.primary,
  },
  form: {
    gap: spacing.lg,
  },
  field: {
    gap: spacing.xs,
  },
  dateRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  dateField: {
    flex: 1,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    letterSpacing: 0.3,
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
    fontSize: typography.fontSize.sm,
    color: colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.sm,
    color: colors.text,
    minHeight: 48,
  },
  textarea: {
    minHeight: 88,
    paddingTop: spacing.md,
  },
  successBtn: {
    backgroundColor: '#16A34A',
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
