import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { AlertTriangle, ArrowRight, FileText } from 'lucide-react-native';
import type { StudentNoticeItem } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface StudentAlertsNoticeCardProps {
  notice: StudentNoticeItem;
  onPress: () => void;
}

function CategoryBadge({ notice }: { notice: StudentNoticeItem }) {
  if (notice.variant === 'urgent') {
    return (
      <View style={styles.urgentBadgeRow}>
        <AlertTriangle size={20} color="#482400" />
        <View style={styles.urgentBadge}>
          <Text style={styles.urgentBadgeText}>{notice.urgentBadge}</Text>
        </View>
      </View>
    );
  }

  const badgeStyle =
    notice.variant === 'standard'
      ? styles.badgeAcademic
      : notice.variant === 'event'
        ? styles.badgeEvent
        : styles.badgeAdmin;

  const textStyle =
    notice.variant === 'standard'
      ? styles.badgeTextAcademic
      : notice.variant === 'event'
        ? styles.badgeTextEvent
        : styles.badgeTextAdmin;

  return (
    <View style={[styles.badge, badgeStyle]}>
      <Text style={[styles.badgeText, textStyle]}>{notice.categoryLabel}</Text>
    </View>
  );
}

function NoticeContent({
  notice,
  onPress,
  showFileIcon,
}: {
  notice: StudentNoticeItem;
  onPress: () => void;
  showFileIcon?: boolean;
}) {
  const isUrgent = notice.variant === 'urgent';

  return (
    <View style={styles.content}>
      <View style={styles.metaRow}>
        <CategoryBadge notice={notice} />
        <Text style={[styles.date, isUrgent && styles.dateUrgent]}>{notice.dateLabel}</Text>
      </View>

      <Text style={[styles.title, isUrgent && styles.titleUrgent]}>{notice.title}</Text>
      <Text style={[styles.excerpt, isUrgent && styles.excerptUrgent]} numberOfLines={2}>
        {notice.excerpt}
      </Text>

      <View style={showFileIcon ? styles.footerRow : undefined}>
        <Pressable style={styles.cta} onPress={onPress}>
          <Text style={[styles.ctaText, isUrgent && styles.ctaTextUrgent]}>{notice.ctaLabel}</Text>
          <ArrowRight size={14} color={isUrgent ? '#482400' : colors.primary} />
        </Pressable>
        {showFileIcon ? <FileText size={20} color={colors.textMuted} /> : null}
      </View>
    </View>
  );
}

export function StudentAlertsNoticeCard({ notice, onPress }: StudentAlertsNoticeCardProps) {
  if (notice.variant === 'event' && notice.imageUrl) {
    return (
      <Pressable style={styles.eventCard} onPress={onPress}>
        <Image source={{ uri: notice.imageUrl }} style={styles.eventImage} />
        <NoticeContent notice={notice} onPress={onPress} />
      </Pressable>
    );
  }

  const cardStyle =
    notice.variant === 'urgent'
      ? styles.urgentCard
      : notice.variant === 'administrative'
        ? styles.adminCard
        : styles.standardCard;

  return (
    <Pressable style={cardStyle} onPress={onPress}>
      <NoticeContent notice={notice} onPress={onPress} showFileIcon={notice.variant === 'standard'} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  urgentCard: {
    backgroundColor: '#FFDCC2',
    borderWidth: 1,
    borderColor: 'rgba(72,36,0,0.1)',
    borderRadius: radii.xl,
  },
  standardCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.xl,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  adminCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.xl,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  eventCard: {
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
  eventImage: {
    width: '100%',
    height: 128,
  },
  content: {
    gap: spacing.sm,
    padding: spacing.lg,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  urgentBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  urgentBadge: {
    backgroundColor: '#683700',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  urgentBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: '#FF972C',
    letterSpacing: 0.5,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  badgeAcademic: {
    borderWidth: 1,
    borderColor: 'rgba(81,97,97,0.2)',
  },
  badgeEvent: {
    backgroundColor: '#AFEFDD',
  },
  badgeAdmin: {
    backgroundColor: colors.secondaryContainer,
  },
  badgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  badgeTextAcademic: {
    color: '#516161',
  },
  badgeTextEvent: {
    color: colors.primary,
    textTransform: 'uppercase',
  },
  badgeTextAdmin: {
    color: '#576867',
    textTransform: 'uppercase',
  },
  date: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  dateUrgent: {
    color: '#6D3A00',
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  titleUrgent: {
    color: '#482400',
  },
  excerpt: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.md * 1.45,
  },
  excerptUrgent: {
    color: '#6D3A00',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ctaText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    letterSpacing: 0.5,
  },
  ctaTextUrgent: {
    color: '#482400',
  },
});
