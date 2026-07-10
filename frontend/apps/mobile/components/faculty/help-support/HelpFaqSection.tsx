import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import type { FacultyHelpFaqItem } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface HelpFaqSectionProps {
  title: string;
  faqs: FacultyHelpFaqItem[];
}

export function HelpFaqSection({ title, faqs }: HelpFaqSectionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(faqs[0]?.id ?? null);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.list}>
        {faqs.map((faq, index) => {
          const isExpanded = expandedId === faq.id;
          const isLast = index === faqs.length - 1;

          return (
            <View key={faq.id} style={[styles.item, !isLast && styles.itemBorder]}>
              <Pressable
                style={styles.questionRow}
                onPress={() => setExpandedId(isExpanded ? null : faq.id)}
                accessibilityRole="button"
                accessibilityState={{ expanded: isExpanded }}
                accessibilityLabel={faq.question}
              >
                <Text style={styles.question}>{faq.question}</Text>
                {isExpanded ? (
                  <ChevronUp size={18} color={colors.primary} />
                ) : (
                  <ChevronDown size={18} color={colors.textSecondary} />
                )}
              </Pressable>
              {isExpanded ? <Text style={styles.answer}>{faq.answer}</Text> : null}
            </View>
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
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.xl,
    overflow: 'hidden',
  },
  item: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  question: {
    flex: 1,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    lineHeight: typography.fontSize.md * typography.lineHeight.normal,
  },
  answer: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
});
