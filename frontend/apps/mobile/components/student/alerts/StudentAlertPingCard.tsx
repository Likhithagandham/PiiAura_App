import { View, Text, StyleSheet, Pressable } from 'react-native';
import { AlertTriangle, ArrowRight, BellRing } from 'lucide-react-native';
import type { StudentAlertPing } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface StudentAlertPingCardProps {
  ping: StudentAlertPing;
  onPress: () => void;
}

const CARD_STYLES = {
  urgent: {
    card: { backgroundColor: '#FFDCC2', borderColor: 'rgba(72,36,0,0.1)' },
    badge: { backgroundColor: '#683700' },
    badgeText: { color: '#FF972C' },
    title: { color: '#482400' },
    message: { color: '#6D3A00' },
    cta: { color: '#482400' },
    icon: '#482400',
  },
  warning: {
    card: { backgroundColor: '#FEFCE8', borderColor: '#FEF08A' },
    badge: { backgroundColor: '#854D0E' },
    badgeText: { color: '#FEFCE8' },
    title: { color: '#713F12' },
    message: { color: '#854D0E' },
    cta: { color: '#854D0E' },
    icon: '#CA8A04',
  },
  info: {
    card: { backgroundColor: colors.white, borderColor: colors.outlineVariant },
    badge: { backgroundColor: colors.secondaryContainer },
    badgeText: { color: '#576867' },
    title: { color: colors.text },
    message: { color: colors.textSecondary },
    cta: { color: colors.primary },
    icon: colors.textSecondary,
  },
} as const;

export function StudentAlertPingCard({ ping, onPress }: StudentAlertPingCardProps) {
  const palette = CARD_STYLES[ping.type];
  const Icon = ping.type === 'urgent' ? AlertTriangle : BellRing;

  return (
    <Pressable
      style={[styles.card, palette.card, ping.unread && styles.unread]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <Icon size={18} color={palette.icon} />
          <View style={[styles.badge, palette.badge]}>
            <Text style={[styles.badgeText, palette.badgeText]}>{ping.typeLabel}</Text>
          </View>
          {ping.unread ? <View style={styles.unreadDot} /> : null}
        </View>
        <Text style={[styles.date, { color: palette.message.color }]}>{ping.dateLabel}</Text>
      </View>

      <Text style={[styles.title, palette.title]}>{ping.title}</Text>
      <Text style={[styles.message, palette.message]}>{ping.message}</Text>

      <Pressable style={styles.cta} onPress={onPress}>
        <Text style={[styles.ctaText, palette.cta]}>{ping.ctaLabel}</Text>
        <ArrowRight size={14} color={palette.cta.color} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  unread: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF972C',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: radii.full,
    backgroundColor: '#BA1A1A',
  },
  date: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
  message: {
    fontSize: typography.fontSize.md,
    lineHeight: typography.fontSize.md * 1.45,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
  },
  ctaText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
});
