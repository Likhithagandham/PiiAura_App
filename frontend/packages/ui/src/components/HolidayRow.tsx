import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, radii } from '../theme';

export interface HolidayRowProps {
  month: string;
  day: string;
  name: string;
  scope: string;
  variant?: 'highlight' | 'default';
}

export function HolidayRow({ month, day, name, scope, variant = 'default' }: HolidayRowProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.dateBadge, variant === 'highlight' && styles.dateBadgeHighlight]}>
        <Text style={[styles.month, variant === 'highlight' && styles.monthHighlight]}>
          {month}
        </Text>
        <Text style={[styles.day, variant === 'highlight' && styles.dayHighlight]}>{day}</Text>
      </View>
      <View style={styles.text}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.scope}>{scope}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  dateBadge: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateBadgeHighlight: {
    backgroundColor: colors.infoBackground,
  },
  month: {
    fontSize: 9,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  monthHighlight: {
    color: colors.infoIcon,
  },
  day: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    lineHeight: typography.fontSize.lg,
  },
  dayHighlight: {
    color: colors.infoIcon,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  scope: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
});
