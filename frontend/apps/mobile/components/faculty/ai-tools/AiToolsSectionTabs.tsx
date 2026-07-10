import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '@piiaura/ui';

export type AiToolsTabKey = 'question-paper' | 'topic-quiz';

interface AiToolsSectionTabsProps {
  active: AiToolsTabKey;
  onChange: (key: AiToolsTabKey) => void;
}

export function AiToolsSectionTabs({ active, onChange }: AiToolsSectionTabsProps) {
  return (
    <View style={styles.container}>
      <Pressable onPress={() => onChange('question-paper')} style={styles.tab}>
        <Text style={[styles.tabText, active === 'question-paper' && styles.activeText]}>
          Question Paper
        </Text>
        {active === 'question-paper' ? <View style={styles.underline} /> : null}
      </Pressable>
      <Pressable onPress={() => onChange('topic-quiz')} style={styles.tab}>
        <Text style={[styles.tabText, active === 'topic-quiz' && styles.activeText]}>
          Topic Quiz
        </Text>
        {active === 'topic-quiz' ? <View style={styles.underline} /> : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    position: 'relative',
  },
  tabText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  activeText: {
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
  },
  underline: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: 0,
    height: 3,
    backgroundColor: colors.primary,
  },
});
