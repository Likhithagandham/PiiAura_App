import { StyleSheet, Text, View } from 'react-native';
import { ClipboardList } from 'lucide-react-native';
import { Button, colors, spacing, typography, radii } from '@piiaura/ui';

interface PayrollNotProcessedProps {
  title: string;
  description: string;
  notifyLabel: string;
  onNotify?: () => void;
}

export function PayrollNotProcessed({
  title,
  description,
  notifyLabel,
  onNotify,
}: PayrollNotProcessedProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <ClipboardList size={36} color="#93000A" />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <Button label={notifyLabel} onPress={onNotify} style={styles.button} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,218,214,0.2)',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#FFDAD6',
    borderRadius: radii.xl,
    padding: spacing['2xl'],
    alignItems: 'center',
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: radii.full,
    backgroundColor: '#FFDAD6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: '#93000A',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
    paddingHorizontal: spacing.lg,
  },
  button: {
    marginTop: spacing['2xl'],
    paddingHorizontal: spacing.lg,
  },
});
