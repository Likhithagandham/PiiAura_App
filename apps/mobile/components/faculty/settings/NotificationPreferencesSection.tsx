import { View, Text, StyleSheet, Switch, Pressable } from 'react-native';
import { AppWindow, Bell, Mail, MessageSquare } from 'lucide-react-native';
import type { FacultyNotificationPreference, FacultyNotificationPreferenceId } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';

const PREFERENCE_ICONS: Record<FacultyNotificationPreferenceId, typeof Bell> = {
  'in-app': AppWindow,
  sms: MessageSquare,
  email: Mail,
};

interface NotificationPreferenceRowProps {
  preference: FacultyNotificationPreference;
  isLast: boolean;
  onToggle: (id: FacultyNotificationPreferenceId, enabled: boolean) => void;
}

export function NotificationPreferenceRow({
  preference,
  isLast,
  onToggle,
}: NotificationPreferenceRowProps) {
  const Icon = PREFERENCE_ICONS[preference.id];

  return (
    <Pressable
      style={[styles.row, !isLast && styles.rowBorder]}
      onPress={() => onToggle(preference.id, !preference.enabled)}
      accessibilityRole="switch"
      accessibilityState={{ checked: preference.enabled }}
      accessibilityLabel={preference.title}
    >
      <View style={styles.left}>
        <View style={styles.iconWrap}>
          <Icon size={20} color={colors.primary} />
        </View>
        <View style={styles.text}>
          <Text style={styles.title}>{preference.title}</Text>
          <Text style={styles.description}>{preference.description}</Text>
        </View>
      </View>
      <Switch
        value={preference.enabled}
        onValueChange={(enabled) => onToggle(preference.id, enabled)}
        trackColor={{ false: colors.outlineVariant, true: colors.primaryContainer }}
        thumbColor={preference.enabled ? colors.primary : colors.white}
        ios_backgroundColor={colors.outlineVariant}
        accessibilityLabel={preference.title}
      />
    </Pressable>
  );
}

interface NotificationPreferencesSectionProps {
  title: string;
  preferences: FacultyNotificationPreference[];
  onToggle: (id: FacultyNotificationPreferenceId, enabled: boolean) => void;
}

export function NotificationPreferencesSection({
  title,
  preferences,
  onToggle,
}: NotificationPreferencesSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Bell size={20} color={colors.primary} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>

      <View style={styles.list}>
        {preferences.map((preference, index) => (
          <NotificationPreferenceRow
            key={preference.id}
            preference={preference}
            isLast={index === preferences.length - 1}
            onToggle={onToggle}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  list: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.xl,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    gap: spacing.md,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: '#D4E6E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: typography.fontSize.lg,
    color: colors.text,
  },
  description: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    letterSpacing: 0.3,
  },
});
