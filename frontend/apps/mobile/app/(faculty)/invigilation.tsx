import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { GraduationCap } from 'lucide-react-native';
import { ROUTES } from '@piiaura/constants';
import { useFacultyInvigilation } from '@piiaura/hooks';
import { colors, spacing, typography, radii } from '@piiaura/ui';
import { InvigilationAlertBanner } from '@/components/faculty/invigilation/InvigilationAlertBanner';
import { InvigilationDutiesSection } from '@/components/faculty/invigilation/InvigilationDutiesSection';
import { InvigilationStatsGrid } from '@/components/faculty/invigilation/InvigilationStatsGrid';
import { useToast } from '@/components/toast/ToastProvider';
import { useModuleWalkthrough } from '@/components/walkthrough/WalkthroughProvider';

export default function FacultyInvigilationScreen() {
  useModuleWalkthrough('invigilation');
  const { data, isLoading, refetch } = useFacultyInvigilation();
  const toast = useToast();

  const handleRefresh = async () => {
    await refetch();
    await new Promise((resolve) => setTimeout(resolve, 600));
    toast.show('Duty list updated', 'info');
  };

  const handleViewLeaveDetails = () => {
    router.push(ROUTES.FACULTY.LEAVE as never);
  };

  if (isLoading || !data) {
    return (
      <View style={styles.screen}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <View style={styles.introRow}>
            <Text style={styles.description}>{data.description}</Text>
            <View style={styles.scopeBadge}>
              <GraduationCap size={16} color={colors.textSecondary} />
              <Text style={styles.scopeText}>{data.scopeLabel}</Text>
            </View>
          </View>
        </View>

        <InvigilationAlertBanner alert={data.alert} onAction={handleViewLeaveDetails} />

        <InvigilationDutiesSection
          title={data.dutiesTitle}
          subtitle={data.dutiesSubtitle}
          refreshLabel={data.refreshLabel}
          duties={data.duties}
          emptyMessage={data.emptyDutiesMessage}
          onRefresh={handleRefresh}
        />

        <InvigilationStatsGrid stats={data.stats} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing['4xl'],
    gap: spacing['2xl'],
  },
  intro: {
    marginTop: spacing.sm,
  },
  introRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  description: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  scopeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surfaceContainerHigh,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  scopeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
  },
});
