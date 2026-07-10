import { StyleSheet, Text, View } from 'react-native';
import { BadgeCheck, Hourglass } from 'lucide-react-native';
import type { FacultyInvigilationStat } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface InvigilationStatsGridProps {
  stats: FacultyInvigilationStat[];
}

const ICONS = {
  completed: BadgeCheck,
  hours: Hourglass,
} as const;

export function InvigilationStatsGrid({ stats }: InvigilationStatsGridProps) {
  return (
    <View style={styles.grid}>
      {stats.map((stat) => {
        const Icon = ICONS[stat.id as keyof typeof ICONS] ?? BadgeCheck;
        const isSecondary = stat.variant === 'secondary';

        return (
          <View
            key={stat.id}
            style={[
              styles.tile,
              isSecondary ? styles.tileSecondary : styles.tileNeutral,
            ]}
          >
            <Icon
              size={24}
              color={isSecondary ? colors.primary : colors.textSecondary}
            />
            <View>
              <Text
                style={[
                  styles.label,
                  !isSecondary && styles.labelNeutral,
                ]}
              >
                {stat.label}
              </Text>
              <Text
                style={[
                  styles.value,
                  !isSecondary && styles.valueNeutral,
                ]}
              >
                {stat.value}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  tile: {
    flex: 1,
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  tileSecondary: {
    backgroundColor: colors.secondaryContainer,
  },
  tileNeutral: {
    backgroundColor: colors.surfaceContainerHigh,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: '#576867',
  },
  labelNeutral: {
    color: colors.textSecondary,
  },
  value: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  valueNeutral: {
    color: colors.text,
  },
});
