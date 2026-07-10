import { View, Text, StyleSheet, Pressable } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { ChevronDown } from 'lucide-react-native';
import type { StudentExamResultsOverview, StudentExamUnitResults } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface StudentExamsPerformanceOverviewProps {
  title: string;
  unit: StudentExamUnitResults;
  onUnitPress: () => void;
}

const ACCENT_ORANGE = '#FF972C';
const PRIMARY_DARK = '#00342B';
const DONUT_SIZE = 160;
const STROKE_WIDTH = 10;

function DualDonutChart({ overview }: { overview: StudentExamResultsOverview }) {
  const radius = (DONUT_SIZE - STROKE_WIDTH) / 2;
  const circumference = 2 * Math.PI * radius;
  const primaryLength = (overview.averagePercent / 100) * circumference;
  const accentLength = (overview.accentPercent / 100) * circumference;

  return (
    <View style={styles.donutWrap}>
      <Svg width={DONUT_SIZE} height={DONUT_SIZE} style={styles.donutSvg}>
        <Circle
          cx={DONUT_SIZE / 2}
          cy={DONUT_SIZE / 2}
          r={radius}
          stroke={colors.surfaceContainerHigh}
          strokeWidth={STROKE_WIDTH}
          fill="none"
        />
        <Circle
          cx={DONUT_SIZE / 2}
          cy={DONUT_SIZE / 2}
          r={radius}
          stroke={PRIMARY_DARK}
          strokeWidth={STROKE_WIDTH}
          fill="none"
          strokeDasharray={`${primaryLength} ${circumference}`}
          strokeLinecap="round"
          rotation="-90"
          origin={`${DONUT_SIZE / 2}, ${DONUT_SIZE / 2}`}
        />
        <Circle
          cx={DONUT_SIZE / 2}
          cy={DONUT_SIZE / 2}
          r={radius}
          stroke={ACCENT_ORANGE}
          strokeWidth={STROKE_WIDTH}
          fill="none"
          strokeDasharray={`${accentLength} ${circumference}`}
          strokeDashoffset={-primaryLength}
          strokeLinecap="round"
          rotation="-90"
          origin={`${DONUT_SIZE / 2}, ${DONUT_SIZE / 2}`}
        />
      </Svg>
      <View style={styles.donutCenter}>
        <Text style={styles.donutPercent}>{overview.averagePercent}%</Text>
        <Text style={styles.donutLabel}>{overview.averageLabel.toUpperCase()}</Text>
      </View>
    </View>
  );
}

export function StudentExamsPerformanceOverview({
  title,
  unit,
  onUnitPress,
}: StudentExamsPerformanceOverviewProps) {
  const { overview } = unit;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Pressable style={styles.unitSelect} onPress={onUnitPress}>
          <Text style={styles.unitSelectText}>{unit.label}</Text>
          <ChevronDown size={18} color={colors.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.body}>
        <DualDonutChart overview={overview} />

        <View style={styles.barSection}>
          <View style={styles.barRow}>
            {overview.barStats.map((stat) => (
              <View key={stat.id} style={styles.barCol}>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      { height: `${stat.percent}%` },
                      stat.variant === 'primary' ? styles.barPrimary : styles.barAccent,
                    ]}
                  />
                </View>
                <Text style={styles.barShortLabel}>{stat.shortLabel}</Text>
                <Text style={styles.barPercent}>{stat.percent}%</Text>
              </View>
            ))}
          </View>
          <Text style={styles.barCaption}>{overview.barCaption}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.xl,
    padding: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
    flex: 1,
  },
  unitSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  unitSelectText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    letterSpacing: 0.5,
  },
  body: {
    alignItems: 'center',
    gap: spacing['2xl'],
  },
  donutWrap: {
    width: DONUT_SIZE,
    height: DONUT_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutSvg: {
    position: 'absolute',
  },
  donutCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  donutPercent: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: PRIMARY_DARK,
  },
  donutLabel: {
    fontSize: 10,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    letterSpacing: 0.8,
    marginTop: 2,
    textAlign: 'center',
  },
  barSection: {
    width: '100%',
    gap: spacing.md,
  },
  barRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    height: 128,
    gap: spacing['2xl'],
    paddingHorizontal: spacing.lg,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.sm,
    maxWidth: 80,
  },
  barTrack: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    minHeight: 8,
  },
  barPrimary: {
    backgroundColor: colors.primaryContainer,
  },
  barAccent: {
    backgroundColor: ACCENT_ORANGE,
  },
  barShortLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  barPercent: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: PRIMARY_DARK,
    letterSpacing: 0.5,
  },
  barCaption: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    letterSpacing: 0.5,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
