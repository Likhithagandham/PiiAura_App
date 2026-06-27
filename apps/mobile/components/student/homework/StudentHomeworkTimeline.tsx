import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import {
  Sigma,
  FlaskConical,
  BookOpen,
  Paperclip,
  Upload,
  CircleCheck,
} from 'lucide-react-native';
import type { StudentHomeworkEntry, StudentHomeworkIconVariant } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface StudentHomeworkTimelineProps {
  entries: StudentHomeworkEntry[];
  onSubmit?: (entryId: string) => void;
  onViewDetails?: (entryId: string) => void;
}

function EntryIcon({ variant }: { variant: StudentHomeworkIconVariant }) {
  const size = 20;
  switch (variant) {
    case 'math':
      return <Sigma size={size} color={colors.primaryContainer} />;
    case 'science':
      return <FlaskConical size={size} color="#FF972C" />;
    case 'literature':
      return <BookOpen size={size} color={colors.textSecondary} />;
    default:
      return <BookOpen size={size} color={colors.textSecondary} />;
  }
}

function iconWrapStyle(variant: StudentHomeworkIconVariant, isNote?: boolean) {
  if (isNote) return styles.noteIconWrap;
  switch (variant) {
    case 'math':
      return styles.iconWrapMath;
    case 'science':
      return styles.iconWrapScience;
    default:
      return styles.iconWrapDefault;
  }
}

function TaskCard({
  entry,
  showConnector,
  onSubmit,
  onViewDetails,
}: {
  entry: StudentHomeworkEntry;
  showConnector: boolean;
  onSubmit?: () => void;
  onViewDetails?: () => void;
}) {
  const isDone = entry.status === 'done';

  return (
    <View style={styles.taskCard}>
      <View style={styles.timelineCol}>
        <View style={iconWrapStyle(entry.iconVariant)}>
          <EntryIcon variant={entry.iconVariant} />
        </View>
        {showConnector ? <View style={styles.connector} /> : null}
      </View>

      <View style={styles.taskBody}>
        <View style={styles.taskHeader}>
          <Text style={styles.metaLabel}>{entry.metaLabel}</Text>
          {entry.statusLabel ? (
            <View style={[styles.statusBadge, isDone ? styles.statusDone : styles.statusPending]}>
              {isDone ? <CircleCheck size={12} color={colors.primaryContainer} fill={colors.primaryContainer} /> : null}
              <Text style={[styles.statusText, isDone ? styles.statusTextDone : styles.statusTextPending]}>
                {entry.statusLabel}
              </Text>
            </View>
          ) : null}
        </View>

        {entry.title ? <Text style={styles.taskTitle}>{entry.title}</Text> : null}
        <Text style={styles.taskDescription}>{entry.description}</Text>

        {entry.attachmentLabel ? (
          <View style={styles.attachmentRow}>
            <Paperclip size={14} color={colors.textSecondary} />
            <Text style={styles.attachmentText}>{entry.attachmentLabel}</Text>
          </View>
        ) : null}

        {entry.submitLabel || entry.detailsLabel ? (
          <View style={styles.actions}>
            {entry.submitLabel ? (
              <Pressable style={styles.submitBtn} onPress={onSubmit}>
                <Upload size={14} color={colors.white} />
                <Text style={styles.submitBtnText}>{entry.submitLabel}</Text>
              </Pressable>
            ) : null}
            {entry.detailsLabel ? (
              <Pressable style={styles.detailsBtn} onPress={onViewDetails}>
                <Text style={styles.detailsBtnText}>{entry.detailsLabel}</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}

function TeacherNoteCard({ entry }: { entry: StudentHomeworkEntry }) {
  return (
    <View style={styles.noteCard}>
      {entry.authorAvatarUrl ? (
        <Image source={{ uri: entry.authorAvatarUrl }} style={styles.noteAvatar} />
      ) : (
        <View style={[styles.noteAvatar, styles.noteAvatarFallback]} />
      )}
      <View style={styles.noteBody}>
        <View style={styles.noteHeader}>
          <Text style={styles.noteMeta}>{entry.metaLabel}</Text>
          {entry.noteTimeLabel ? <Text style={styles.noteTime}>{entry.noteTimeLabel}</Text> : null}
        </View>
        <Text style={styles.noteText}>{entry.description}</Text>
      </View>
    </View>
  );
}

export function StudentHomeworkTimeline({ entries, onSubmit, onViewDetails }: StudentHomeworkTimelineProps) {
  if (entries.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No diary entries for this day.</Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {entries.map((entry, index) =>
        entry.kind === 'teacher_note' ? (
          <TeacherNoteCard key={entry.id} entry={entry} />
        ) : (
          <TaskCard
            key={entry.id}
            entry={entry}
            showConnector={index < entries.length - 1}
            onSubmit={() => onSubmit?.(entry.id)}
            onViewDetails={() => onViewDetails?.(entry.id)}
          />
        ),
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
  empty: {
    padding: spacing['2xl'],
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  taskCard: {
    flexDirection: 'row',
    gap: spacing.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.xl,
    padding: spacing.lg,
  },
  timelineCol: {
    alignItems: 'center',
    width: 40,
  },
  iconWrapMath: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapScience: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: '#683700',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapDefault: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connector: {
    width: 2,
    flex: 1,
    minHeight: 24,
    backgroundColor: 'rgba(191,201,196,0.3)',
    borderRadius: radii.full,
    marginTop: spacing.sm,
  },
  taskBody: {
    flex: 1,
    gap: spacing.sm,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  metaLabel: {
    flex: 1,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  statusDone: {
    backgroundColor: 'rgba(0,52,43,0.1)',
  },
  statusPending: {
    backgroundColor: 'rgba(72,36,0,0.1)',
  },
  statusText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
  },
  statusTextDone: {
    color: colors.primaryContainer,
  },
  statusTextPending: {
    color: '#482400',
  },
  taskTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  taskDescription: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.md * 1.45,
  },
  attachmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
  },
  attachmentText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
  },
  submitBtnText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
    letterSpacing: 0.5,
  },
  detailsBtn: {
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
  },
  detailsBtnText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primaryContainer,
    letterSpacing: 0.5,
  },
  noteCard: {
    flexDirection: 'row',
    gap: spacing.lg,
    backgroundColor: colors.surfaceContainerHigh,
    borderLeftWidth: 4,
    borderLeftColor: colors.primaryContainer,
    borderTopRightRadius: radii.xl,
    borderBottomRightRadius: radii.xl,
    padding: spacing.lg,
  },
  noteAvatar: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  noteAvatarFallback: {
    backgroundColor: colors.surfaceContainer,
  },
  noteBody: {
    flex: 1,
    gap: spacing.sm,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  noteMeta: {
    flex: 1,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primaryContainer,
    letterSpacing: 0.5,
  },
  noteTime: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  noteText: {
    fontSize: typography.fontSize.lg,
    fontStyle: 'italic',
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    lineHeight: typography.fontSize.lg * 1.35,
  },
});
