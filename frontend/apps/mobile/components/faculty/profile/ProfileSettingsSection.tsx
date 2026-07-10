import { View, Text, StyleSheet, Pressable } from 'react-native';
import { BellRing, ChevronRight, LockKeyhole, LogOut } from 'lucide-react-native';
import type { FacultyProfileSettingItem } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';

const SETTING_ICONS = {
  password: LockKeyhole,
  notifications: BellRing,
} as const;

interface ProfileSettingsSectionProps {
  sectionLabel: string;
  settings: FacultyProfileSettingItem[];
  logoutLabel: string;
  onSettingPress: (id: string) => void;
  onLogout: () => void;
}

export function ProfileSettingsSection({
  sectionLabel,
  settings,
  logoutLabel,
  onSettingPress,
  onLogout,
}: ProfileSettingsSectionProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>{sectionLabel}</Text>

      <View style={styles.list}>
        {settings.map((item) => {
          const Icon = SETTING_ICONS[item.id as keyof typeof SETTING_ICONS] ?? LockKeyhole;
          return (
            <Pressable
              key={item.id}
              style={styles.row}
              onPress={() => onSettingPress(item.id)}
              accessibilityRole="button"
              accessibilityLabel={item.label}
            >
              <View style={styles.rowLeft}>
                <Icon size={20} color={colors.textSecondary} />
                <Text style={styles.rowLabel}>{item.label}</Text>
              </View>
              <ChevronRight size={18} color={colors.textSecondary} />
            </Pressable>
          );
        })}
      </View>

      <Pressable
        style={styles.logoutBtn}
        onPress={onLogout}
        accessibilityRole="button"
        accessibilityLabel={logoutLabel}
      >
        <LogOut size={20} color={colors.error} />
        <Text style={styles.logoutText}>{logoutLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    paddingTop: spacing.md,
  },
  sectionLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.xs,
  },
  list: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.xl,
    padding: spacing.lg,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  rowLabel: {
    fontSize: typography.fontSize.lg,
    color: colors.text,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: radii.xl,
  },
  logoutText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.error,
  },
});
