import React, { type ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, radii } from '../theme';

export interface SectionCardProps {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}

export function SectionCard({ title, subtitle, action, children }: SectionCardProps) {
  return (
    <View style={styles.container}>
      {(title || action) && (
        <View style={styles.header}>
          <View style={styles.headerText}>
            {title ? <Text style={styles.title}>{title}</Text> : null}
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          {action}
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
});
