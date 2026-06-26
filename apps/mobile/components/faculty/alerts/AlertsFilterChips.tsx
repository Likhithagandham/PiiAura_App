import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { FacultyAlertFilter, FacultyAlertsFilterOption } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface AlertsFilterChipsProps {
  filters: FacultyAlertsFilterOption[];
  active: FacultyAlertFilter;
  onChange: (filter: FacultyAlertFilter) => void;
}

export function AlertsFilterChips({ filters, active, onChange }: AlertsFilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {filters.map((filter) => {
        const isActive = filter.id === active;
        return (
          <Pressable
            key={filter.id}
            style={[styles.chip, isActive && styles.chipActive]}
            onPress={() => onChange(filter.id)}
          >
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
              {filter.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceContainerHigh,
  },
  chipActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  chipText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.white,
  },
});
