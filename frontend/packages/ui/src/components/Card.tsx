import React from 'react';
import { View, StyleSheet, type ViewProps } from 'react-native';
import { colors, spacing, radii } from '../theme';

export interface CardProps extends ViewProps {
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: keyof typeof spacing;
}

export function Card({
  variant = 'elevated',
  padding = 'lg',
  style,
  children,
  ...props
}: CardProps) {
  return (
    <View
      style={[
        styles.base,
        styles[variant],
        { padding: spacing[padding] },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
  },
  elevated: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  outlined: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  filled: {
    backgroundColor: colors.surfaceSecondary,
  },
});
