import { View, Text, StyleSheet } from 'react-native';
import { TrendingUp, Calendar, MapPin } from 'lucide-react-native';
import type { StudentExamFeatured } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface StudentExamsFeaturedCardProps {
  featured: StudentExamFeatured;
}

export function StudentExamsFeaturedCard({ featured }: StudentExamsFeaturedCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.trendsHeader}>
        <Text style={styles.trendsTitle}>{featured.trendsTitle}</Text>
        <View style={styles.growthRow}>
          <TrendingUp size={16} color="#94D3C1" />
          <Text style={styles.growthLabel}>{featured.growthLabel}</Text>
        </View>
      </View>

      <View style={styles.chartRow}>
        {featured.trendBars.map((bar) => (
          <View key={bar.id} style={styles.barCol}>
            <View style={[styles.bar, { height: `${bar.heightPercent}%` }]} />
          </View>
        ))}
      </View>

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.legendDotPrimary]} />
          <View>
            <Text style={styles.legendLabel}>{featured.yourScoreLabel}</Text>
            <Text style={styles.legendValue}>{featured.yourScoreValue}</Text>
          </View>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.legendDotMuted]} />
          <View>
            <Text style={styles.legendLabel}>{featured.classAvgLabel}</Text>
            <Text style={styles.legendValue}>{featured.classAvgValue}</Text>
          </View>
        </View>
      </View>

      <View style={styles.nextPaperSection}>
        <View style={styles.nextPaperBadge}>
          <Text style={styles.nextPaperBadgeText}>{featured.nextPaperBadge}</Text>
        </View>
        <Text style={styles.nextPaperTitle}>{featured.nextPaperTitle}</Text>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Calendar size={18} color="rgba(255,255,255,0.9)" />
            <Text style={styles.metaText}>{featured.dateLabel}</Text>
          </View>
          <View style={styles.metaItem}>
            <MapPin size={18} color="rgba(255,255,255,0.9)" />
            <Text style={styles.metaText}>{featured.locationLabel}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primaryContainer,
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.lg,
    overflow: 'hidden',
  },
  trendsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trendsTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: 'rgba(255,255,255,0.9)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  growthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  growthLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: '#94D3C1',
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    height: 64,
  },
  barCol: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    minHeight: 8,
  },
  legendRow: {
    flexDirection: 'row',
    gap: spacing['2xl'],
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: radii.full,
  },
  legendDotPrimary: {
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  legendDotMuted: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  legendLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 0.5,
  },
  legendValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  nextPaperSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  nextPaperBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#D4E6E5',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  nextPaperBadgeText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: '#3A4A49',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  nextPaperTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    lineHeight: typography.fontSize['2xl'] * 1.2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    gap: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 1,
  },
  metaText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 0.5,
    flexShrink: 1,
  },
});
