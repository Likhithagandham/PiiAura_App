import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { CheckCheck } from 'lucide-react-native';
import { useFacultyAlerts } from '@piiaura/hooks';
import type { FacultyAlertAction, FacultyAlertFilter } from '@piiaura/types';
import { colors, spacing, typography } from '@piiaura/ui';
import { AlertsFilterChips } from '@/components/faculty/alerts/AlertsFilterChips';
import { FacultyAlertCard } from '@/components/faculty/alerts/FacultyAlertCard';
import { AlertsEmptyState } from '@/components/faculty/alerts/AlertsEmptyState';
import { useToast } from '@/components/toast/ToastProvider';

export default function FacultyAnnouncementsScreen() {
  const { data, isLoading } = useFacultyAlerts();
  const toast = useToast();
  const [activeFilter, setActiveFilter] = useState<FacultyAlertFilter>('all');
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  const visibleAlerts = useMemo(() => {
    if (!data) return [];
    return data.alerts.filter((alert) => {
      if (dismissedIds.includes(alert.id)) return false;
      if (activeFilter === 'all') return true;
      return alert.category === activeFilter;
    });
  }, [data, activeFilter, dismissedIds]);

  const handleMarkAllRead = () => {
    if (!data) return;
    setDismissedIds(data.alerts.map((alert) => alert.id));
    toast.show('All alerts marked as read', 'success');
  };

  const handleAction = (alertId: string, action: FacultyAlertAction) => {
    if (action.variant === 'dismiss') {
      setDismissedIds((prev) => [...prev, alertId]);
      return;
    }
    if (action.route) {
      router.push(action.route as never);
      return;
    }
    toast.show(action.label, 'info');
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
        <View style={styles.sectionHeader}>
          <View style={styles.sectionText}>
            <Text style={styles.sectionTitle}>{data.sectionTitle}</Text>
            <Text style={styles.sectionDescription}>{data.sectionDescription}</Text>
          </View>
          <Pressable style={styles.markAllBtn} onPress={handleMarkAllRead}>
            <CheckCheck size={18} color={colors.primary} />
            <Text style={styles.markAllText}>{data.markAllReadLabel}</Text>
          </Pressable>
        </View>

        <AlertsFilterChips
          filters={data.filters}
          active={activeFilter}
          onChange={setActiveFilter}
        />

        {visibleAlerts.length === 0 ? (
          <AlertsEmptyState
            title={data.emptyTitle}
            description={data.emptyDescription}
          />
        ) : (
          <View style={styles.list}>
            {visibleAlerts.map((alert) => (
              <FacultyAlertCard
                key={alert.id}
                alert={alert}
                onAction={handleAction}
              />
            ))}
          </View>
        )}
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
    gap: spacing.lg,
  },
  sectionHeader: {
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  sectionText: {
    gap: spacing.xs,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  sectionDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'flex-start',
  },
  markAllText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  list: {
    gap: spacing.md,
  },
});
