import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, radii } from '../theme';

export interface BadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
}

export function Badge({ label, variant = 'default', size = 'sm' }: BadgeProps) {
  return (
    <View style={[styles.base, styles[variant], styles[`size_${size}`]]}>
      <Text style={[styles.label, styles[`label_${variant}`], styles[`labelSize_${size}`]]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderRadius: radii.full,
  },
  default: { backgroundColor: colors.surfaceSecondary },
  success: { backgroundColor: '#D1FAE5' },
  warning: { backgroundColor: '#FEF3C7' },
  error: { backgroundColor: '#FEE2E2' },
  info: { backgroundColor: '#DBEAFE' },
  size_sm: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  size_md: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  label: {
    fontWeight: typography.fontWeight.medium,
  },
  label_default: { color: colors.textSecondary },
  label_success: { color: '#065F46' },
  label_warning: { color: '#92400E' },
  label_error: { color: '#991B1B' },
  label_info: { color: '#1E40AF' },
  labelSize_sm: { fontSize: typography.fontSize.xs },
  labelSize_md: { fontSize: typography.fontSize.sm },
});
