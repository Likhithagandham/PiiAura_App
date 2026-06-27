import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '@piiaura/ui';

interface ScreenPlaceholderProps {
  title: string;
  role: 'faculty' | 'student' | 'auth';
}

export function ScreenPlaceholder({ title, role }: ScreenPlaceholderProps) {
  if (role === 'faculty' || role === 'student') {
    return (
      <View style={styles.tabScreen}>
        <View style={styles.container}>
          <Text style={styles.subtitle}>
            Screen skeleton ready — awaiting Stitch design reference.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.badge}>{role.toUpperCase()}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>
          Screen skeleton ready — awaiting Stitch design reference.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tabScreen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['2xl'],
    gap: spacing.md,
  },
  badge: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
    letterSpacing: 1,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.fontSize.md * typography.lineHeight.relaxed,
  },
});
