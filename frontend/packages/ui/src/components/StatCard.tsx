import React, { type ReactNode } from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { colors, spacing, typography, radii } from '../theme';

export interface StatCardProps {
  label: string;
  value: string;
  footer?: ReactNode;
  icon?: ReactNode;
  style?: ViewStyle;
}

export function StatCard({ label, value, footer, icon, style }: StatCardProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        {icon ? <View style={styles.icon}>{icon}</View> : null}
      </View>
      <Text style={styles.value}>{value}</Text>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  label: {
    flex: 1,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textMuted,
    letterSpacing: 0.6,
  },
  icon: {
    marginLeft: spacing.sm,
  },
  value: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    lineHeight: typography.fontSize['3xl'] * typography.lineHeight.tight,
  },
  footer: {
    marginTop: spacing.md,
  },
});
