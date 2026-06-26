import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, radii } from '../theme';

const ROLE_ROWS = [
  { role: 'Parent / Admin', identifier: 'Phone number' },
  { role: 'Faculty', identifier: 'Employee Code' },
  { role: 'Student', identifier: 'Admission Number' },
] as const;

export function RoleLegendBox() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>WHO ARE YOU SIGNING IN AS?</Text>
      <View style={styles.rows}>
        {ROLE_ROWS.map((row) => (
          <View key={row.role} style={styles.row}>
            <Text style={styles.role}>{row.role}</Text>
            <Text style={styles.identifier}>{row.identifier}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  heading: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.textMuted,
    letterSpacing: 0.8,
  },
  rows: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  role: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  identifier: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'right',
  },
});
