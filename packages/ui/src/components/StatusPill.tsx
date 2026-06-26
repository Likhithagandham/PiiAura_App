import React, { type ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, radii } from '../theme';

export interface StatusPillProps {
  label: string;
  icon?: ReactNode;
  variant?: 'warning' | 'default';
}

export function StatusPill({ label, icon, variant = 'default' }: StatusPillProps) {
  return (
    <View style={[styles.container, variant === 'warning' && styles.warning]}>
      {icon}
      <Text style={[styles.label, variant === 'warning' && styles.warningLabel]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceSecondary,
  },
  warning: {
    backgroundColor: '#FFEDD5',
  },
  label: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  warningLabel: {
    color: '#C2410C',
  },
});
