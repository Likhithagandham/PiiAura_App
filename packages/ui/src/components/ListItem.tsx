import React, { type ComponentType, type ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, typography, radii } from '../theme';
import { Avatar } from './Avatar';

export type IconComponent = ComponentType<{
  size?: number;
  color?: string;
  strokeWidth?: number;
}>;

export interface ListItemProps {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  leftIcon?: IconComponent;
  showAvatar?: boolean;
  avatarName?: string;
  avatarUrl?: string;
  rightElement?: ReactNode;
  showChevron?: boolean;
}

export function ListItem({
  title,
  subtitle,
  onPress,
  leftIcon: LeftIcon,
  showAvatar,
  avatarName,
  avatarUrl,
  rightElement,
  showChevron = !!onPress,
}: ListItemProps) {
  const content = (
    <>
      {showAvatar && avatarName ? (
        <Avatar name={avatarName} imageUrl={avatarUrl} size="md" />
      ) : LeftIcon ? (
        <View style={styles.iconContainer}>
          <LeftIcon size={20} color={colors.primary} />
        </View>
      ) : null}
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {rightElement}
      {showChevron && !rightElement ? (
        <Text style={styles.chevron}>›</Text>
      ) : null}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.container}>{content}</View>;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  chevron: {
    fontSize: typography.fontSize.xl,
    color: colors.textMuted,
    fontWeight: typography.fontWeight.regular,
  },
});
