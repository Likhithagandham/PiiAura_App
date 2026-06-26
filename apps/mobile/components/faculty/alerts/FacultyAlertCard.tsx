import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  AlertTriangle,
  BookOpen,
  CalendarX,
  Download,
  Settings,
  X,
} from 'lucide-react-native';
import type { FacultyAlertAction, FacultyAlertItem } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface FacultyAlertCardProps {
  alert: FacultyAlertItem;
  onAction?: (alertId: string, action: FacultyAlertAction) => void;
}

const SEVERITY_THEME = {
  critical: {
    accent: colors.error,
    border: 'rgba(255,218,214,0.3)',
    iconBg: '#FFDAD6',
    iconColor: '#93000A',
    badgeBg: 'rgba(255,218,214,0.5)',
    badgeColor: '#93000A',
    Icon: AlertTriangle,
  },
  academic: {
    accent: colors.primary,
    border: colors.outlineVariant,
    iconBg: colors.secondaryContainer,
    iconColor: '#576867',
    badgeBg: colors.secondaryContainer,
    badgeColor: '#576867',
    Icon: BookOpen,
  },
  warning: {
    accent: '#683700',
    border: 'rgba(104,55,0,0.2)',
    iconBg: '#FFDCC2',
    iconColor: '#2E1500',
    badgeBg: 'rgba(255,220,194,0.5)',
    badgeColor: '#2E1500',
    Icon: CalendarX,
  },
  system: {
    accent: '#516161',
    border: colors.outlineVariant,
    iconBg: colors.surfaceContainerHigh,
    iconColor: colors.textSecondary,
    badgeBg: colors.surfaceContainerHigh,
    badgeColor: colors.textSecondary,
    Icon: Download,
  },
  update: {
    accent: colors.outlineVariant,
    border: colors.outlineVariant,
    iconBg: colors.surfaceContainerHigh,
    iconColor: colors.textSecondary,
    badgeBg: colors.surfaceContainerHigh,
    badgeColor: colors.textSecondary,
    Icon: Settings,
  },
} as const;

export function FacultyAlertCard({ alert, onAction }: FacultyAlertCardProps) {
  const theme = SEVERITY_THEME[alert.severity];
  const Icon = theme.Icon;

  const primaryActions = alert.actions.filter((action) => action.variant !== 'dismiss');
  const dismissAction = alert.actions.find((action) => action.variant === 'dismiss');

  return (
    <View
      style={[
        styles.card,
        { borderColor: theme.border },
        alert.featured && styles.featured,
        alert.severity === 'critical' && styles.criticalCard,
      ]}
    >
      <View style={[styles.accent, { backgroundColor: theme.accent }]} />

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconWrap, { backgroundColor: theme.iconBg }]}>
              <Icon size={20} color={theme.iconColor} />
            </View>
            <View style={[styles.badge, { backgroundColor: theme.badgeBg }]}>
              <Text style={[styles.badgeText, { color: theme.badgeColor }]}>
                {alert.severityLabel}
              </Text>
            </View>
          </View>
          <Text style={styles.time}>{alert.timeLabel}</Text>
        </View>

        <Text style={styles.title}>{alert.title}</Text>
        <Text style={styles.description}>{alert.description}</Text>

        <View style={styles.actions}>
          {primaryActions.map((action) => (
            <Pressable
              key={action.id}
              style={[
                styles.actionBtn,
                action.variant === 'primary' && styles.actionPrimary,
                action.variant === 'outline' && styles.actionOutline,
                action.variant === 'muted' && styles.actionMuted,
                primaryActions.length === 1 && dismissAction && styles.actionFlex,
                primaryActions.length === 1 && !dismissAction && styles.actionFull,
              ]}
              onPress={() => onAction?.(alert.id, action)}
            >
              {action.variant === 'muted' ? (
                <View style={styles.mutedContent}>
                  <Download size={18} color={colors.text} />
                  <Text style={styles.actionMutedText}>{action.label}</Text>
                </View>
              ) : (
                <Text
                  style={[
                    styles.actionText,
                    action.variant === 'primary' && styles.actionTextPrimary,
                    action.variant === 'outline' && styles.actionTextOutline,
                  ]}
                >
                  {action.label}
                </Text>
              )}
            </Pressable>
          ))}
          {dismissAction ? (
            <Pressable
              style={styles.dismissBtn}
              onPress={() => onAction?.(alert.id, dismissAction)}
            >
              <X size={20} color={colors.textSecondary} />
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderRadius: radii.xl,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
    flexDirection: 'row',
  },
  featured: {
    width: '100%',
  },
  criticalCard: {
    borderColor: 'rgba(255,218,214,0.3)',
  },
  accent: {
    width: 6,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  iconWrap: {
    padding: spacing.sm,
    borderRadius: radii.lg,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  time: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    opacity: 0.7,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  actionBtn: {
    paddingVertical: 10,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionFlex: {
    flex: 1,
  },
  actionFull: {
    width: '100%',
  },
  actionPrimary: {
    backgroundColor: colors.primary,
  },
  actionOutline: {
    borderWidth: 1,
    borderColor: colors.primary,
    width: '100%',
  },
  actionMuted: {
    backgroundColor: colors.surfaceContainerHigh,
    width: '100%',
  },
  actionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  actionTextPrimary: {
    color: colors.white,
  },
  actionTextOutline: {
    color: colors.primary,
  },
  mutedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionMutedText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  dismissBtn: {
    padding: 10,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceContainer,
  },
});
