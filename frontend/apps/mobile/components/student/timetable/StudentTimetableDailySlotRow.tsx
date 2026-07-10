import { View, Text, StyleSheet } from 'react-native';
import { FlaskConical, MapPin, DoorOpen } from 'lucide-react-native';
import type { StudentTimetableDailySlot } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';
import { TIMETABLE_CATEGORY_COLORS } from '@/components/student/timetable/timetableCategoryStyles';

interface StudentTimetableDailySlotRowProps {
  slot: StudentTimetableDailySlot;
}

function LocationIcon({
  icon,
  active,
}: {
  icon: NonNullable<StudentTimetableDailySlot['locationIcon']>;
  active?: boolean;
}) {
  const size = 14;
  const color = active ? 'rgba(255,255,255,0.9)' : colors.textSecondary;
  if (icon === 'science') return <FlaskConical size={size} color={color} />;
  if (icon === 'room') return <DoorOpen size={size} color={color} />;
  return <MapPin size={size} color={color} />;
}

export function StudentTimetableDailySlotRow({ slot }: StudentTimetableDailySlotRowProps) {
  if (slot.kind === 'break') {
    return (
      <View style={styles.breakRow}>
        <View style={styles.timeCol}>
          <Text style={styles.breakTime}>{slot.startTime}</Text>
        </View>
        <View style={styles.breakContent}>
          <View style={styles.breakLine} />
          <Text style={styles.breakLabel}>{slot.breakLabel}</Text>
          <View style={styles.breakLine} />
        </View>
      </View>
    );
  }

  const category = slot.category ?? 'core';
  const palette = TIMETABLE_CATEGORY_COLORS[category];
  const isActive = slot.isActive;

  return (
    <View style={[styles.row, !isActive && styles.rowMuted]}>
      <View style={styles.timeCol}>
        <Text style={[styles.time, isActive && styles.timeActive]}>{slot.startTime}</Text>
        {slot.durationLabel ? <Text style={styles.duration}>{slot.durationLabel}</Text> : null}
      </View>

      <View
        style={[
          styles.card,
          isActive
            ? styles.cardActive
            : {
                borderLeftColor: palette.accent,
              },
        ]}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.subject, isActive && styles.subjectActive]} numberOfLines={2}>
            {slot.subject}
          </Text>
          {slot.categoryLabel ? (
            <View style={[styles.badge, { backgroundColor: palette.badgeBg }]}>
              <Text style={[styles.badgeText, { color: palette.badgeText }]}>{slot.categoryLabel}</Text>
            </View>
          ) : null}
        </View>

        {slot.location ? (
          <View style={styles.metaRow}>
            <LocationIcon icon={slot.locationIcon ?? 'location'} active={isActive} />
            <Text style={[styles.metaText, isActive && styles.metaTextActive]}>{slot.location}</Text>
          </View>
        ) : null}

        {slot.facultyName ? (
          <View style={styles.facultyRow}>
            {slot.facultyInitials ? (
              <View style={styles.initials}>
                <Text style={styles.initialsText}>{slot.facultyInitials}</Text>
              </View>
            ) : null}
            <Text style={[styles.facultyName, isActive && styles.facultyNameActive]}>
              {slot.facultyName}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const TIME_COL_WIDTH = 52;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  rowMuted: {
    opacity: 0.9,
  },
  timeCol: {
    width: TIME_COL_WIDTH,
    paddingTop: spacing.lg,
    alignItems: 'flex-end',
    paddingRight: spacing.xs,
  },
  time: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.textSecondary,
  },
  timeActive: {
    color: colors.primaryContainer,
  },
  duration: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  card: {
    flex: 1,
    minWidth: 0,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderLeftWidth: 6,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardActive: {
    backgroundColor: colors.primaryContainer,
    borderColor: 'rgba(0,52,43,0.2)',
    borderLeftColor: '#94D3C1',
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  subject: {
    flex: 1,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primaryContainer,
    lineHeight: typography.fontSize.md * 1.25,
  },
  subjectActive: {
    color: colors.white,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.full,
    marginTop: 1,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: typography.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.md,
  },
  metaText: {
    flex: 1,
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  metaTextActive: {
    color: 'rgba(255,255,255,0.9)',
  },
  facultyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  initials: {
    width: 24,
    height: 24,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.primaryContainer,
  },
  facultyName: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
  },
  facultyNameActive: {
    color: 'rgba(255,255,255,0.95)',
  },
  breakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    opacity: 0.6,
    marginVertical: spacing.sm,
    paddingVertical: spacing.md,
  },
  breakTime: {
    width: TIME_COL_WIDTH,
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'right',
    paddingRight: spacing.xs,
  },
  breakContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  breakLine: {
    flex: 1,
    height: 1,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.outlineVariant,
  },
  breakLabel: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
});
