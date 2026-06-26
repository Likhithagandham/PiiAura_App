import React, { type ReactNode } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { colors, spacing, typography, radii } from '../theme';

export interface ActionTileProps {
  title: string;
  subtitle: string;
  icon: ReactNode;
  variant?: 'primary' | 'secondary';
  onPress?: () => void;
}

export function ActionTile({
  title,
  subtitle,
  icon,
  variant = 'secondary',
  onPress,
}: ActionTileProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.container, variant === 'primary' ? styles.primary : styles.secondary]}
    >
      <View style={styles.row}>
        <View style={styles.icon}>{icon}</View>
        <View style={styles.text}>
          <Text style={[styles.title, variant === 'primary' && styles.titlePrimary]}>{title}</Text>
          <Text style={[styles.subtitle, variant === 'primary' && styles.subtitlePrimary]}>
            {subtitle}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: radii.lg,
    padding: spacing.lg,
    minHeight: 110,
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  titlePrimary: {
    color: colors.white,
  },
  subtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  subtitlePrimary: {
    color: 'rgba(255,255,255,0.8)',
  },
});
