import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Calendar, MoreVertical, Users } from 'lucide-react-native';
import type { FacultyAssignmentItem } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface AssignmentListCardProps {
  assignment: FacultyAssignmentItem;
  onOptionSelect?: (assignment: FacultyAssignmentItem, action: string) => void;
}

const ACCENT_COLORS = {
  primary: colors.primary,
  tertiary: '#FF972C',
} as const;

const MENU_OPTIONS = [
  { id: 'submissions', label: 'View submissions' },
  { id: 'edit', label: 'Edit assignment' },
  { id: 'remind', label: 'Send reminder' },
] as const;

export function AssignmentListCard({ assignment, onOptionSelect }: AssignmentListCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const progress =
    assignment.totalStudents > 0
      ? assignment.submittedCount / assignment.totalStudents
      : 0;
  const progressPercent = Math.round(progress * 100);
  const accent = ACCENT_COLORS[assignment.accentColor];

  const handleOptionPress = (actionId: string, label: string) => {
    setMenuOpen(false);
    onOptionSelect?.(assignment, actionId);
  };

  return (
    <>
      <View
        style={styles.card}
        accessible
        accessibilityLabel={`${assignment.title}, ${assignment.subject}, ${assignment.className}`}
        accessibilityHint={`Due ${assignment.dueLabel.replace('Due ', '')}. ${assignment.submittedCount} of ${assignment.totalStudents} students submitted.`}
      >
        <View
          style={[styles.accentBar, { backgroundColor: accent }]}
          accessibilityElementsHidden
          importantForAccessibility="no"
        />
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.badge} accessibilityRole="text">
                <Text style={styles.badgeText}>
                  {assignment.subject} • {assignment.className}
                </Text>
              </View>
              <Text style={styles.title} accessibilityRole="header">
                {assignment.title}
              </Text>
            </View>
            <Pressable
              hitSlop={12}
              onPress={() => setMenuOpen(true)}
              accessibilityRole="button"
              accessibilityLabel={`Assignment options for ${assignment.title}`}
              accessibilityHint="Opens actions menu"
            >
              <View accessibilityElementsHidden importantForAccessibility="no">
                <MoreVertical size={20} color={colors.textSecondary} />
              </View>
            </Pressable>
          </View>

          <View style={styles.metaRow} accessibilityRole="text">
            <View style={styles.metaItem}>
              <View accessibilityElementsHidden importantForAccessibility="no">
                <Calendar size={16} color={colors.textSecondary} />
              </View>
              <Text style={styles.metaText}>{assignment.dueLabel}</Text>
            </View>
            <View style={styles.metaItem}>
              <View accessibilityElementsHidden importantForAccessibility="no">
                <Users size={16} color="#FF972C" />
              </View>
              <Text style={styles.metaTextHighlight}>
                {assignment.submittedCount} / {assignment.totalStudents} Submitted
              </Text>
            </View>
          </View>

          <View
            style={styles.track}
            accessible
            accessibilityRole="progressbar"
            accessibilityLabel={`Submission progress for ${assignment.title}`}
            accessibilityValue={{
              min: 0,
              max: assignment.totalStudents,
              now: assignment.submittedCount,
              text: `${progressPercent}% submitted`,
            }}
          >
            <View
              style={[styles.fill, { width: `${progressPercent}%`, backgroundColor: accent }]}
              accessibilityElementsHidden
              importantForAccessibility="no"
            />
          </View>
        </View>
      </View>

      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        accessibilityViewIsModal
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable
          style={styles.menuOverlay}
          onPress={() => setMenuOpen(false)}
          accessibilityRole="button"
          accessibilityLabel="Close assignment options"
        >
          <Pressable
            style={styles.menuSheet}
            onPress={(event) => event.stopPropagation()}
            accessibilityRole="menu"
            accessibilityLabel={`Options for ${assignment.title}`}
          >
            <Text style={styles.menuTitle} accessibilityRole="header">
              {assignment.title}
            </Text>
            {MENU_OPTIONS.map((option) => (
              <Pressable
                key={option.id}
                style={styles.menuOption}
                onPress={() => handleOptionPress(option.id, option.label)}
                accessibilityRole="menuitem"
                accessibilityLabel={option.label}
              >
                <Text style={styles.menuOptionText}>{option.label}</Text>
              </Pressable>
            ))}
            <Pressable
              style={[styles.menuOption, styles.menuCancel]}
              onPress={() => setMenuOpen(false)}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
            >
              <Text style={styles.menuCancelText}>Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.xl,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  accentBar: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
    gap: spacing.xs,
    paddingRight: spacing.sm,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  badgeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: '#576867',
  },
  title: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  metaTextHighlight: {
    fontSize: typography.fontSize.sm,
    color: '#FF972C',
  },
  track: {
    height: 8,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceContainerHigh,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radii.full,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  menuSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  menuTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  menuOption: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  menuOptionText: {
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  menuCancel: {
    borderBottomWidth: 0,
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  menuCancelText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
});
