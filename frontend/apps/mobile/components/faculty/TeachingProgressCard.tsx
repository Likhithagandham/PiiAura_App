import { View, Text, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface TeachingProgressCardProps {
  percent: number;
}

export function TeachingProgressCard({ percent }: TeachingProgressCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.label}>TEACHING PROGRESS</Text>
        <Text style={styles.percent}>{percent}%</Text>
        <Text style={styles.subtitle}>Syllabus completion</Text>
      </View>
      <View style={styles.watermark}>
        <Check size={80} color="rgba(255,255,255,0.15)" strokeWidth={3} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    padding: spacing.lg,
    overflow: 'hidden',
    minHeight: 120,
    justifyContent: 'center',
  },
  content: {
    gap: spacing.xs,
    zIndex: 1,
  },
  label: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 0.8,
  },
  percent: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  watermark: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.md,
  },
});
