import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors, typography, radii } from '../theme';

export interface AvatarProps {
  name: string;
  imageUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  tone?: 'light' | 'dark';
}

const SIZES = { sm: 32, md: 40, lg: 56, xl: 80 } as const;
const FONT_SIZES = { sm: 12, md: 14, lg: 20, xl: 28 } as const;

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function Avatar({ name, imageUrl, size = 'md', tone = 'light' }: AvatarProps) {
  const dimension = SIZES[size];
  const bgColor = tone === 'dark' ? colors.primary : colors.primaryLight;

  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={[styles.image, { width: dimension, height: dimension, borderRadius: dimension / 2 }]}
      />
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        { width: dimension, height: dimension, borderRadius: dimension / 2, backgroundColor: bgColor },
      ]}
    >
      <Text style={[styles.initials, { fontSize: FONT_SIZES[size] }]}>{getInitials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.surfaceSecondary,
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: colors.white,
    fontWeight: typography.fontWeight.semibold,
  },
});
