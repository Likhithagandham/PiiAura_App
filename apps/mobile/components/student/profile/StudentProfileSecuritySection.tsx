import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Lock, BellRing, Mail, ChevronRight, type LucideIcon } from 'lucide-react-native';
import type { StudentProfileSecurityItem } from '@piiaura/types';
import { colors, spacing, typography, radii, IosToggle } from '@piiaura/ui';

const ICONS: Record<string, LucideIcon> = {
  password: Lock,
  'push-notifications': BellRing,
  'email-attendance-alerts': Mail,
};

interface StudentProfileSecuritySectionProps {
  title: string;
  items: StudentProfileSecurityItem[];
  toggles: Record<string, boolean>;
  onToggle: (id: string, value: boolean) => void;
  onAction: (id: string) => void;
}

export function StudentProfileSecuritySection({
  title,
  items,
  toggles,
  onToggle,
  onAction,
}: StudentProfileSecuritySectionProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
      <View style={styles.body}>
        {items.map((item, index) => {
          const Icon = ICONS[item.id] ?? Lock;
          const isLast = index === items.length - 1;

          return (
            <View key={item.id}>
              {item.type === 'action' ? (
                <Pressable style={styles.actionRow} onPress={() => onAction(item.id)}>
                  <View style={styles.rowLeft}>
                    <Icon size={22} color={colors.textSecondary} />
                    <Text style={styles.rowLabel}>{item.label}</Text>
                  </View>
                  <ChevronRight size={20} color={colors.textMuted} />
                </Pressable>
              ) : (
                <View style={styles.toggleRow}>
                  <View style={styles.rowLeft}>
                    <Icon size={22} color={colors.textSecondary} />
                    <Text style={styles.rowLabel}>{item.label}</Text>
                  </View>
                  <IosToggle
                    value={toggles[item.id] ?? false}
                    onChange={(value) => onToggle(item.id, value)}
                  />
                </View>
              )}
              {!isLast ? <View style={styles.divider} /> : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.xl,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: '#F3F4F5',
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  headerTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  body: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.sm,
    borderRadius: radii.lg,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.sm,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  rowLabel: {
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.outlineVariant,
    marginHorizontal: spacing.sm,
  },
});
