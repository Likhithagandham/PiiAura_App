import { View, Text, StyleSheet, Pressable } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import type { StudentFeeAlert } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface StudentFeeAlertCardProps {
  alert: StudentFeeAlert;
  onPayNow?: () => void;
  onViewDetails?: () => void;
}

export function StudentFeeAlertCard({ alert, onPayNow, onViewDetails }: StudentFeeAlertCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <AlertCircle size={24} color="#C62828" />
        <View style={styles.text}>
          <Text style={styles.amount}>{alert.amountLabel}</Text>
          <Pressable onPress={onViewDetails} accessibilityRole="link">
            <Text style={styles.details}>{alert.detailsLabel}</Text>
          </Pressable>
        </View>
      </View>
      <Pressable
        style={styles.payBtn}
        onPress={onPayNow}
        accessibilityRole="button"
        accessibilityLabel={alert.payNowLabel}
      >
        <Text style={styles.payText}>{alert.payNowLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#FFCDD2',
    borderRadius: radii.xl,
    padding: spacing.lg,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    flex: 1,
  },
  text: {
    flex: 1,
    gap: spacing.xs,
  },
  amount: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: '#C62828',
  },
  details: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: '#C62828',
    textDecorationLine: 'underline',
  },
  payBtn: {
    backgroundColor: '#C62828',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  payText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
});
