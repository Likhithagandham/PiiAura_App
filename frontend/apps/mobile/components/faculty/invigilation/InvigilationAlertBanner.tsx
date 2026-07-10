import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import type { FacultyInvigilationAlert } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface InvigilationAlertBannerProps {
  alert: FacultyInvigilationAlert;
  onAction?: () => void;
}

export function InvigilationAlertBanner({ alert, onAction }: InvigilationAlertBannerProps) {
  return (
    <View style={styles.banner} accessibilityRole="alert">
      <View accessibilityElementsHidden importantForAccessibility="no">
        <AlertTriangle size={22} color="#683700" />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{alert.title}</Text>
        <Text style={styles.description}>
          {alert.description}{' '}
          <Text style={styles.link} onPress={onAction} accessibilityRole="link">
            {alert.actionLabel}
          </Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: '#FFF8E1',
    borderWidth: 1,
    borderColor: '#FFE082',
    borderRadius: radii.xl,
    padding: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  link: {
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
});
