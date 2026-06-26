import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Check, Circle, ChevronRight, X } from 'lucide-react-native';
import type { FacultySyllabusSubject } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface SyllabusSubjectDetailModalProps {
  subject: FacultySyllabusSubject | null;
  visible: boolean;
  onClose: () => void;
}

const CHAPTER_ICONS = {
  completed: Check,
  current: ChevronRight,
  upcoming: Circle,
} as const;

const CHAPTER_COLORS = {
  completed: colors.primary,
  current: '#FF972C',
  upcoming: colors.textMuted,
} as const;

export function SyllabusSubjectDetailModal({
  subject,
  visible,
  onClose,
}: SyllabusSubjectDetailModalProps) {
  if (!subject) return null;

  const completedCount = subject.chapters.filter((chapter) => chapter.status === 'completed').length;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      accessibilityViewIsModal
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close details" />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.title}>{subject.name}</Text>
              <Text style={styles.subtitle}>{subject.classLabel}</Text>
            </View>
            <Pressable
              onPress={onClose}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <X size={20} color={colors.textSecondary} />
            </Pressable>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryTile}>
              <Text style={styles.summaryValue}>{subject.percent}%</Text>
              <Text style={styles.summaryLabel}>Complete</Text>
            </View>
            <View style={styles.summaryTile}>
              <Text style={styles.summaryValue}>
                {completedCount}/{subject.chapters.length}
              </Text>
              <Text style={styles.summaryLabel}>Chapters done</Text>
            </View>
            <View style={styles.summaryTile}>
              <Text style={[styles.summaryValue, styles.statusValue]}>{subject.statusLabel}</Text>
              <Text style={styles.summaryLabel}>Status</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Chapter progress</Text>
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {subject.chapters.map((chapter) => {
              const Icon = CHAPTER_ICONS[chapter.status];
              const iconColor = CHAPTER_COLORS[chapter.status];
              return (
                <View key={chapter.id} style={styles.chapterRow}>
                  <View style={[styles.chapterIcon, { backgroundColor: `${iconColor}22` }]}>
                    <Icon size={16} color={iconColor} />
                  </View>
                  <View style={styles.chapterText}>
                    <Text style={styles.chapterTitle}>{chapter.title}</Text>
                    <Text style={styles.chapterStatus}>
                      {chapter.status === 'completed'
                        ? 'Completed'
                        : chapter.status === 'current'
                          ? 'In progress'
                          : 'Upcoming'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          <Text style={styles.updated}>{subject.lastUpdatedLabel}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
    maxHeight: '85%',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radii.full,
    backgroundColor: colors.outlineVariant,
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  headerText: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  closeBtn: {
    padding: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  summaryTile: {
    flex: 1,
    backgroundColor: '#F3F4F5',
    borderRadius: radii.lg,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  summaryValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    textAlign: 'center',
  },
  statusValue: {
    fontSize: typography.fontSize.sm,
  },
  summaryLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  list: {
    maxHeight: 280,
  },
  chapterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  chapterIcon: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chapterText: {
    flex: 1,
    gap: 2,
  },
  chapterTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  chapterStatus: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  updated: {
    marginTop: spacing.lg,
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
