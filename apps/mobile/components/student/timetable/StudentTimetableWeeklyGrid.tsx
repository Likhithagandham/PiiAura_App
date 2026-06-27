import { View, Text, StyleSheet } from 'react-native';
import type {
  StudentTimetableLegendItem,
  StudentTimetableWeeklyCell,
  StudentTimetableWeeklyRow,
} from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';
import { TIMETABLE_CATEGORY_COLORS } from '@/components/student/timetable/timetableCategoryStyles';

interface StudentTimetableWeeklyGridProps {
  dayHeaders: string[];
  rows: StudentTimetableWeeklyRow[];
  legendTitle: string;
  legend: StudentTimetableLegendItem[];
}

function WeeklyCell({ cell }: { cell: StudentTimetableWeeklyCell | null }) {
  if (!cell) {
    return (
      <View style={styles.emptyCell}>
        <View style={styles.emptyCellInner} />
      </View>
    );
  }

  const palette = TIMETABLE_CATEGORY_COLORS[cell.category];

  return (
    <View style={styles.cell}>
      <View
        style={[
          styles.cellInner,
          {
            backgroundColor: palette.weeklyBg,
            borderLeftColor: palette.accent,
          },
        ]}
      >
        <Text style={[styles.cellCode, { color: palette.weeklyText }]} numberOfLines={2}>
          {cell.code}
        </Text>
      </View>
    </View>
  );
}

export function StudentTimetableWeeklyGrid({
  dayHeaders,
  rows,
  legendTitle,
  legend,
}: StudentTimetableWeeklyGridProps) {
  return (
    <View style={styles.container}>
      <View style={styles.gridCard}>
        <View style={styles.headerRow}>
          <View style={styles.timeHeader}>
            <Text style={styles.headerMuted}>TIME</Text>
          </View>
          {dayHeaders.map((header) => (
            <View key={header} style={styles.dayHeader}>
              <Text style={[styles.headerText, header === 'MON' && styles.headerActive]}>
                {header}
              </Text>
            </View>
          ))}
        </View>

        {rows.map((row) => (
          <View key={row.timeLabel} style={styles.dataRow}>
            <View style={styles.timeHeader}>
              <Text style={styles.timeLabel}>{row.timeLabel}</Text>
            </View>
            {row.cells.map((cell, index) => (
              <WeeklyCell key={`${row.timeLabel}-${index}`} cell={cell} />
            ))}
          </View>
        ))}
      </View>

      <View style={styles.legendCard}>
        <Text style={styles.legendTitle}>{legendTitle}</Text>
        <View style={styles.legendGrid}>
          {legend.map((item) => (
            <View key={item.id} style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: TIMETABLE_CATEGORY_COLORS[item.category].accent },
                ]}
              />
              <Text style={styles.legendLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const TIME_COL_WIDTH = 50;

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  gridCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.xl,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceContainer,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
    paddingVertical: spacing.sm,
  },
  dataRow: {
    flexDirection: 'row',
    minHeight: 64,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(191,201,196,0.3)',
  },
  timeHeader: {
    width: TIME_COL_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  dayHeader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  headerMuted: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.textMuted,
  },
  headerText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.textSecondary,
  },
  headerActive: {
    color: colors.primaryContainer,
  },
  timeLabel: {
    fontSize: 9,
    fontWeight: typography.fontWeight.medium,
    color: colors.textMuted,
  },
  cell: {
    flex: 1,
    padding: 2,
    justifyContent: 'center',
  },
  cellInner: {
    flex: 1,
    borderLeftWidth: 2,
    borderRadius: 4,
    padding: 4,
    justifyContent: 'center',
  },
  cellCode: {
    fontSize: 8,
    fontWeight: typography.fontWeight.bold,
    lineHeight: 10,
  },
  emptyCell: {
    flex: 1,
    padding: 2,
  },
  emptyCellInner: {
    flex: 1,
    backgroundColor: colors.surfaceContainerHigh,
    borderLeftWidth: 2,
    borderLeftColor: colors.textMuted,
    borderRadius: 4,
    opacity: 0.4,
  },
  legendCard: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: radii.xl,
    padding: spacing.lg,
  },
  legendTitle: {
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
    color: colors.primaryContainer,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    width: '46%',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: radii.full,
  },
  legendLabel: {
    fontSize: 10,
    color: colors.text,
    flex: 1,
  },
});
