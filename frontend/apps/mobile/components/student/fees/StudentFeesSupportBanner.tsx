import { View, Text, StyleSheet, Pressable } from 'react-native';
import { HelpCircle } from 'lucide-react-native';
import type { StudentFeesSupport } from '@piiaura/types';
import { spacing, typography, radii } from '@piiaura/ui';

interface StudentFeesSupportBannerProps {
  support: StudentFeesSupport;
  onContact: () => void;
}

export function StudentFeesSupportBanner({ support, onContact }: StudentFeesSupportBannerProps) {
  return (
    <View style={styles.banner}>
      <View style={styles.left}>
        <HelpCircle size={22} color="#6D3A00" />
        <Text style={styles.message}>{support.message}</Text>
      </View>
      <Pressable style={styles.button} onPress={onContact}>
        <Text style={styles.buttonText}>{support.buttonLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFDCC2',
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  message: {
    flex: 1,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: '#6D3A00',
    letterSpacing: 0.5,
  },
  button: {
    backgroundColor: '#683700',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
  },
  buttonText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
