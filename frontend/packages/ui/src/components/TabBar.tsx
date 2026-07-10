import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { ComponentType } from 'react';
import { colors, spacing, typography } from '../theme';

export type IconComponent = ComponentType<{
  size?: number;
  color?: string;
  strokeWidth?: number;
}>;

export interface TabBarItem {
  key: string;
  label: string;
  icon: IconComponent;
}

export interface TabBarProps {
  items: TabBarItem[];
  activeKey: string;
  onTabPress: (key: string) => void;
}

export function TabBar({ items, activeKey, onTabPress }: TabBarProps) {
  return (
    <View style={styles.container}>
      {items.map((item) => {
        const isActive = item.key === activeKey;
        const Icon = item.icon;
        return (
          <TouchableOpacity
            key={item.key}
            style={styles.tab}
            onPress={() => onTabPress(item.key)}
            activeOpacity={0.7}
          >
            <Icon
              size={22}
              color={isActive ? colors.primary : colors.textMuted}
              strokeWidth={isActive ? 2.5 : 2}
            />
            <Text style={[styles.label, isActive && styles.labelActive]}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: spacing.sm,
    paddingTop: spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  label: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    fontWeight: typography.fontWeight.medium,
  },
  labelActive: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
});
