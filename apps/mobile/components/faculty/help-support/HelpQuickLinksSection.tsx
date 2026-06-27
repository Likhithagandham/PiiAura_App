import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ChevronRight, ExternalLink } from 'lucide-react-native';
import type { FacultyHelpQuickLink } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface HelpQuickLinksSectionProps {
  title: string;
  links: FacultyHelpQuickLink[];
  onLinkPress?: (link: FacultyHelpQuickLink) => void;
}

export function HelpQuickLinksSection({ title, links, onLinkPress }: HelpQuickLinksSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.list}>
        {links.map((link, index) => {
          const isLast = index === links.length - 1;

          return (
            <Pressable
              key={link.id}
              style={[styles.row, !isLast && styles.rowBorder]}
              onPress={() => onLinkPress?.(link)}
              accessibilityRole="button"
              accessibilityLabel={link.label}
            >
              <View style={styles.text}>
                <Text style={styles.label}>{link.label}</Text>
                <Text style={styles.description}>{link.description}</Text>
              </View>
              <ChevronRight size={18} color={colors.textSecondary} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

interface HelpSubmitTicketButtonProps {
  label: string;
  footnote: string;
  onPress: () => void;
}

export function HelpSubmitTicketButton({ label, footnote, onPress }: HelpSubmitTicketButtonProps) {
  return (
    <View style={styles.submitSection}>
      <Pressable
        style={styles.button}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <ExternalLink size={18} color={colors.white} />
        <Text style={styles.buttonText}>{label}</Text>
      </Pressable>
      <Text style={styles.footnote}>{footnote}</Text>
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
  text: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  submitSection: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: radii.xl,
  },
  buttonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
  footnote: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});
