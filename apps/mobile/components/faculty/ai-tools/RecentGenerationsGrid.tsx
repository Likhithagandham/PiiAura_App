import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FileText, GraduationCap } from 'lucide-react-native';
import type { FacultyAiRecentGeneration } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface RecentGenerationsGridProps {
  items: FacultyAiRecentGeneration[];
  onItemPress?: (item: FacultyAiRecentGeneration) => void;
}

export function RecentGenerationsGrid({ items, onItemPress }: RecentGenerationsGridProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Recent Generations</Text>
      <View style={styles.grid}>
        {items.map((item) => {
          const isSecondary = item.variant === 'secondary';
          return (
            <Pressable
              key={item.id}
              style={[
                styles.tile,
                isSecondary ? styles.tileSecondary : styles.tileNeutral,
              ]}
              onPress={() => onItemPress?.(item)}
            >
              {isSecondary ? (
                <FileText size={28} color={colors.primary} />
              ) : (
                <GraduationCap size={28} color={colors.textSecondary} />
              )}
              <View>
                <Text
                  style={[
                    styles.tileTitle,
                    !isSecondary && styles.tileTitleNeutral,
                  ]}
                >
                  {item.title}
                </Text>
                <Text
                  style={[
                    styles.tileTime,
                    isSecondary ? styles.tileTimeSecondary : styles.tileTimeNeutral,
                  ]}
                >
                  {item.timeLabel}
                </Text>
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
    gap: spacing.sm,
  },
  sectionLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: spacing.xs,
  },
  grid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  tile: {
    flex: 1,
    height: 128,
    borderRadius: radii.xl,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  tileSecondary: {
    backgroundColor: colors.secondaryContainer,
  },
  tileNeutral: {
    backgroundColor: colors.surfaceContainerHigh,
  },
  tileTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  tileTitleNeutral: {
    color: colors.text,
  },
  tileTime: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },
  tileTimeSecondary: {
    color: '#576867',
  },
  tileTimeNeutral: {
    color: colors.textSecondary,
  },
});
