import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Clock, Mail, Phone } from 'lucide-react-native';
import type { FacultyHelpContact } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';

const CONTACT_ICONS = {
  it: Mail,
  hr: Phone,
  hours: Clock,
} as const;

interface HelpContactSectionProps {
  title: string;
  contacts: FacultyHelpContact[];
  onContactPress?: (contact: FacultyHelpContact) => void;
}

export function HelpContactSection({ title, contacts, onContactPress }: HelpContactSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.list}>
        {contacts.map((contact) => {
          const Icon = CONTACT_ICONS[contact.id as keyof typeof CONTACT_ICONS] ?? Mail;

          return (
            <Pressable
              key={contact.id}
              style={styles.card}
              onPress={() => onContactPress?.(contact)}
              accessibilityRole="button"
              accessibilityLabel={`${contact.label}, ${contact.value}`}
            >
              <View style={styles.iconWrap}>
                <Icon size={20} color={colors.primary} />
              </View>
              <View style={styles.text}>
                <Text style={styles.label}>{contact.label}</Text>
                <Text style={styles.value}>{contact.value}</Text>
                <Text style={styles.hint}>{contact.hint}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: spacing.xs,
  },
  list: {
    gap: spacing.sm,
  },
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.xl,
    padding: spacing.lg,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  value: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  hint: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
