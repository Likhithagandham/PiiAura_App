import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, radii } from '../theme';

export interface ProgressBarProps {
  label: string;
  current: number;
  total: number;
  fillColor?: string;
  trackColor?: string;
}

export function ProgressBar({ label, current, total, fillColor, trackColor }: ProgressBarProps) {
  const progress = total > 0 ? current / total : 0;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.count}>
          {current}/{total}
        </Text>
      </View>
      <View style={[styles.track, trackColor ? { backgroundColor: trackColor } : undefined]}>
        <View
          style={[
            styles.fill,
            { width: `${Math.min(progress * 100, 100)}%` },
            fillColor ? { backgroundColor: fillColor } : undefined,
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  count: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  track: {
    height: 8,
    backgroundColor: colors.borderLight,
    borderRadius: radii.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radii.full,
  },
});
