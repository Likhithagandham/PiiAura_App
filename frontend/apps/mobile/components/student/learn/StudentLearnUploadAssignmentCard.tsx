import { View, Text, StyleSheet, Pressable } from 'react-native';
import {
  Calendar,
  CalendarCheck,
  CircleCheck,
  FileText,
  FileUp,
  Upload,
  X,
} from 'lucide-react-native';
import type { StudentLearnUploadAssignment } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface StudentLearnUploadAssignmentCardProps {
  assignment: StudentLearnUploadAssignment;
  selectedFileName?: string;
  onPickFile?: () => void;
  onClearFile?: () => void;
  onUpload?: () => void;
  onViewSubmission?: () => void;
}

export function StudentLearnUploadAssignmentCard({
  assignment,
  selectedFileName,
  onPickFile,
  onClearFile,
  onUpload,
  onViewSubmission,
}: StudentLearnUploadAssignmentCardProps) {
  const isSubmitted = assignment.status === 'submitted';
  const isPending = assignment.status === 'pending';
  const fileName = selectedFileName ?? assignment.selectedFileName;
  const DueIcon = assignment.dueIcon === 'event_available' ? CalendarCheck : Calendar;

  return (
    <View style={[styles.card, isSubmitted && styles.cardSubmitted]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.statusBadge, isSubmitted ? styles.statusSubmitted : styles.statusPending]}>
            <Text
              style={[
                styles.statusText,
                isSubmitted ? styles.statusTextSubmitted : styles.statusTextPending,
              ]}
            >
              {isSubmitted ? 'Submitted' : 'Pending'}
            </Text>
          </View>
          <Text style={styles.title}>{assignment.title}</Text>
          <Text style={styles.subject}>{assignment.subject}</Text>
        </View>
        <View style={styles.dueRow}>
          <DueIcon size={16} color={colors.textSecondary} />
          <Text style={styles.dueLabel}>{assignment.dueLabel}</Text>
        </View>
      </View>

      {assignment.description ? (
        <View style={styles.descriptionBox}>
          <Text style={styles.description}>{assignment.description}</Text>
        </View>
      ) : null}

      {isPending ? (
        <View style={styles.uploadRow}>
          <Pressable style={styles.fileField} onPress={onPickFile}>
            {fileName ? (
              <FileText size={18} color={colors.textMuted} />
            ) : (
              <FileUp size={18} color={colors.textMuted} />
            )}
            <Text
              style={[styles.fileName, !fileName && styles.filePlaceholder]}
              numberOfLines={1}
            >
              {fileName ?? assignment.filePlaceholder ?? 'Select file...'}
            </Text>
            {fileName ? (
              <Pressable
                onPress={(event) => {
                  event.stopPropagation?.();
                  onClearFile?.();
                }}
                hitSlop={8}
                accessibilityLabel="Remove file"
              >
                <X size={18} color={colors.primaryContainer} />
              </Pressable>
            ) : null}
          </Pressable>
          <Pressable style={styles.uploadBtn} onPress={onUpload}>
            <Upload size={18} color={colors.white} />
            <Text style={styles.uploadBtnText}>{assignment.uploadLabel}</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.submittedFooter}>
          <View style={styles.submittedInfo}>
            <View style={styles.submittedIconWrap}>
              <CircleCheck size={20} color={colors.primaryContainer} />
            </View>
            <View style={styles.submittedText}>
              <Text style={styles.submittedAt}>{assignment.submittedAtLabel}</Text>
              <Text style={styles.submittedFile}>{assignment.submittedFileName}</Text>
            </View>
          </View>
          <Pressable style={styles.viewBtn} onPress={onViewSubmission}>
            <Text style={styles.viewBtnText}>{assignment.viewSubmissionLabel}</Text>
          </Pressable>
        </View>
      )}
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
    gap: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardSubmitted: {
    borderLeftWidth: 4,
    borderLeftColor: '#94D3C1',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerLeft: {
    flex: 1,
    gap: spacing.xs,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  statusPending: {
    backgroundColor: '#FFDCC2',
  },
  statusSubmitted: {
    backgroundColor: '#AFEFDD',
  },
  statusText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  statusTextPending: {
    color: '#6D3A00',
  },
  statusTextSubmitted: {
    color: '#065043',
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  subject: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  dueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: '42%',
  },
  dueLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    letterSpacing: 0.5,
    flexShrink: 1,
  },
  descriptionBox: {
    backgroundColor: '#F3F4F5',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.outlineVariant,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  description: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.md * 1.45,
  },
  uploadRow: {
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  fileField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  fileName: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  filePlaceholder: {
    color: colors.textMuted,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primaryContainer,
    borderRadius: radii.lg,
    paddingVertical: 10,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  uploadBtnText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
    letterSpacing: 0.5,
  },
  submittedFooter: {
    gap: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(191,201,196,0.3)',
  },
  submittedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  submittedIconWrap: {
    backgroundColor: colors.secondaryContainer,
    padding: spacing.sm,
    borderRadius: radii.full,
  },
  submittedText: {
    flex: 1,
    gap: 2,
  },
  submittedAt: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    letterSpacing: 0.5,
  },
  submittedFile: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  viewBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primaryContainer,
    borderRadius: radii.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  viewBtnText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primaryContainer,
    letterSpacing: 0.5,
  },
});
