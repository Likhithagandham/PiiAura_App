import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import type { StudentNoticeCategory } from '@piiaura/types';
import { useStudentNotices } from '@piiaura/hooks';
import { colors, spacing, typography } from '@piiaura/ui';
import { StudentAlertsCategoryChips } from '@/components/student/alerts/StudentAlertsCategoryChips';
import { StudentAlertsNoticeCard } from '@/components/student/alerts/StudentAlertsNoticeCard';
import { useToast } from '@/components/toast/ToastProvider';
import { useModuleWalkthrough } from '@/components/walkthrough/WalkthroughProvider';

export default function StudentNoticesScreen() {
  useModuleWalkthrough('notices');
  const { data, isLoading } = useStudentNotices();
  const toast = useToast();
  const [selectedCategory, setSelectedCategory] = useState<StudentNoticeCategory>('all');

  const filteredNotices = useMemo(() => {
    if (!data) return [];
    if (selectedCategory === 'all') return data.notices;
    return data.notices.filter((notice) => notice.category === selectedCategory);
  }, [data, selectedCategory]);

  if (isLoading || !data) {
    return (
      <View style={styles.screen}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading notices...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.intro}>
          <Text style={styles.title}>{data.title}</Text>
          <Text style={styles.description}>{data.description}</Text>
        </View>

        <StudentAlertsCategoryChips
          categories={data.categories}
          selectedId={selectedCategory}
          onSelect={setSelectedCategory}
        />

        <View style={styles.feed}>
          {filteredNotices.map((notice) => (
            <StudentAlertsNoticeCard
              key={notice.id}
              notice={notice}
              onPress={() => toast.show(`${notice.title} — full notice coming soon`, 'info')}
            />
          ))}

          {filteredNotices.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No notices in this category yet.</Text>
            </View>
          ) : null}
        </View>

        <Pressable
          style={styles.loadMore}
          onPress={() => toast.show('More notices coming soon', 'info')}
        >
          <Text style={styles.loadMoreText}>{data.loadMoreLabel}</Text>
          <ChevronDown size={18} color={colors.primary} />
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8F9FA',
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
  intro: {
    gap: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  description: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.md * 1.4,
  },
  feed: {
    gap: spacing.lg,
  },
  empty: {
    padding: spacing['2xl'],
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  loadMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  loadMoreText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
    letterSpacing: 0.5,
  },
});
