import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, spacing, typography, radii } from '../theme';

export interface AccentTaskCardProps {
  title: string;
  description: string;
  count: number;
  accentColor: string;
  onPress?: () => void;
}

export function AccentTaskCard({
  title,
  description,
  count,
  accentColor,
  onPress,
}: AccentTaskCardProps) {
  return (
    <Pressable onPress={onPress} style={styles.container}>
      <View style={[styles.accent, { backgroundColor: accentColor }]} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.count}>{count}</Text>
        </View>
        <Text style={styles.description}>{description}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
  },
  accent: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  count: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginLeft: spacing.md,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
});
