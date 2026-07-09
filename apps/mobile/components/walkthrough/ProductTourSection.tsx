import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Map, PlayCircle } from 'lucide-react-native';
import type { WalkthroughModuleOption } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';
import { useWalkthrough } from '@/components/walkthrough/WalkthroughProvider';

interface ProductTourSectionProps {
  title?: string;
  description?: string;
  modules: WalkthroughModuleOption[];
}

export function ProductTourSection({
  title = 'Product Tour',
  description = 'Replay guided tours for the dashboard or individual modules.',
  modules,
}: ProductTourSectionProps) {
  const { replayDashboardTour, replayModuleTour } = useWalkthrough();

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Map size={18} color={colors.primaryContainer} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
      </View>

      <Pressable style={styles.primaryCard} onPress={replayDashboardTour} accessibilityRole="button">
        <View style={styles.cardLeft}>
          <PlayCircle size={20} color={colors.primaryContainer} />
          <View>
            <Text style={styles.cardTitle}>Complete ERP Tour</Text>
            <Text style={styles.cardSubtitle}>Walk through your dashboard and navigation</Text>
          </View>
        </View>
        <Text style={styles.cardAction}>Replay</Text>
      </Pressable>

      <Text style={styles.subheading}>Individual Module Tours</Text>
      <View style={styles.moduleList}>
        {modules.map((module) => (
          <Pressable
            key={module.id}
            style={styles.moduleCard}
            onPress={() => replayModuleTour(module.id)}
            accessibilityRole="button"
          >
            <View style={styles.cardLeft}>
              <Text style={styles.moduleTitle}>{module.label}</Text>
              <Text style={styles.moduleDescription}>{module.description}</Text>
            </View>
            <Text style={styles.cardAction}>Start</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radii.lg,
    backgroundColor: '#E8F5F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  primaryCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  cardTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  cardSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cardAction: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.primaryContainer,
  },
  subheading: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: spacing.xs,
  },
  moduleList: {
    gap: spacing.sm,
  },
  moduleCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  moduleTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  moduleDescription: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
