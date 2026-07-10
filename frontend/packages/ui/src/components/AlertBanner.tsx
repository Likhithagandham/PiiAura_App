import React, { type ReactNode } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, spacing, typography, radii } from '../theme';

export interface AlertBannerProps {
  message: string;
  count?: number;
  actionLabel?: string;
  onActionPress?: () => void;
  icon?: ReactNode;
  variant?: 'default' | 'leave';
}

const VARIANT_STYLES = {
  default: {
    container: {
      backgroundColor: colors.warningBackground,
      borderColor: colors.warningBorder,
    },
    iconWrap: {},
    text: { color: colors.warningText },
    action: { color: colors.warningText },
  },
  leave: {
    container: {
      backgroundColor: '#FFE7D1',
      borderColor: '#FED7AA',
    },
    iconWrap: {
      backgroundColor: 'rgba(255,255,255,0.4)',
      borderRadius: radii.full,
      padding: 6,
    },
    text: { color: '#6D3A00' },
    action: { color: '#482400' },
  },
} as const;

export function AlertBanner({
  message,
  count,
  actionLabel,
  onActionPress,
  icon,
  variant = 'default',
}: AlertBannerProps) {
  const variantStyle = VARIANT_STYLES[variant];
  const prefix =
    count !== undefined ? (
      <Text style={{ fontWeight: typography.fontWeight.bold }}>Leave requests pending ({count})</Text>
    ) : null;

  return (
    <View style={[styles.container, variantStyle.container]}>
      {icon ? <View style={[styles.icon, variantStyle.iconWrap]}>{icon}</View> : null}
      <Text style={[styles.text, variantStyle.text]}>
        {prefix}
        {prefix ? ' — ' : ''}
        {message}
        {actionLabel ? (
          <>
            {' '}
            <Text style={[styles.action, variantStyle.action]} onPress={onActionPress}>
              {actionLabel}
            </Text>
          </>
        ) : null}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radii.xl,
    padding: spacing.lg,
  },
  icon: {
    marginTop: 2,
  },
  text: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
  },
  action: {
    fontWeight: typography.fontWeight.bold,
    textDecorationLine: 'underline',
  },
});
