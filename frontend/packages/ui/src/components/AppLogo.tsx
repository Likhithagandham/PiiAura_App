import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, radii } from '../theme';

export function AppLogo() {
  return (
    <View style={styles.container}>
      <Text style={styles.pii}>Pii</Text>
      <Text style={styles.aura}>AURA</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 72,
    height: 72,
    borderRadius: radii.lg,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xs,
  },
  pii: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    lineHeight: typography.fontSize['2xl'] * typography.lineHeight.tight,
  },
  aura: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.white,
    letterSpacing: 2,
    marginTop: -2,
  },
});
