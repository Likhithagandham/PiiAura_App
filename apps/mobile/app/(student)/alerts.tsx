import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { useStudentAlerts } from '@piiaura/hooks';
import { colors, spacing, typography, radii } from '@piiaura/ui';
import { StudentAlertPingCard } from '@/components/student/alerts/StudentAlertPingCard';
import { useToast } from '@/components/toast/ToastProvider';

export default function StudentAlertsScreen() {
  const { data, isLoading } = useStudentAlerts();
  const toast = useToast();

  if (isLoading || !data) {
    return (
      <View style={styles.screen}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading alerts...</Text>
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
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{data.unreadLabel}</Text>
          </View>
        </View>

        <View style={styles.feed}>
          {data.pings.map((ping) => (
            <StudentAlertPingCard
              key={ping.id}
              ping={ping}
              onPress={() => toast.show(`${ping.title} — action coming soon`, 'info')}
            />
          ))}
        </View>

        <Pressable
          style={styles.loadMore}
          onPress={() => toast.show('More alerts coming soon', 'info')}
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
  unreadBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFDAD6',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.full,
    marginTop: spacing.xs,
  },
  unreadText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: '#93000A',
    letterSpacing: 0.5,
  },
  feed: {
    gap: spacing.md,
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
