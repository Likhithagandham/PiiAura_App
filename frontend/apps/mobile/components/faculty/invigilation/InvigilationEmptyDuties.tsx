import { StyleSheet, Text, View } from 'react-native';
import { ClipboardList } from 'lucide-react-native';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface InvigilationEmptyDutiesProps {
  message: string;
}

export function InvigilationEmptyDuties({ message }: InvigilationEmptyDutiesProps) {
  return (
    <View style={styles.container}>
      <ClipboardList size={48} color={colors.outlineVariant} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.outlineVariant,
    borderRadius: radii.lg,
    padding: spacing['3xl'],
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    opacity: 0.6,
  },
  message: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
