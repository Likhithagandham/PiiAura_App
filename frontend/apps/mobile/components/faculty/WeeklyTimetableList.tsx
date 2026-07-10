import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MapPin, Clock, Coffee } from 'lucide-react-native';
import type { FacultyWeeklyTimetableSlot } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';

interface WeeklyTimetableListProps {
  slots: FacultyWeeklyTimetableSlot[];
}

interface TimeGroup {
  time: string;
  slots: FacultyWeeklyTimetableSlot[];
  isBreak: boolean;
}

function groupSlotsByTime(slots: FacultyWeeklyTimetableSlot[]): TimeGroup[] {
  const groups: TimeGroup[] = [];
  const indexByTime = new Map<string, number>();

  for (const slot of slots) {
    const isBreak = slot.title.toLowerCase().includes('break');
    const existingIndex = indexByTime.get(slot.time);

    if (existingIndex === undefined) {
      indexByTime.set(slot.time, groups.length);
      groups.push({ time: slot.time, slots: [slot], isBreak });
      continue;
    }

    if (!isBreak) {
      groups[existingIndex].slots.push(slot);
    }
  }

  return groups;
}

function getTimePeriod(time: string): string {
  const hour = parseInt(time.split(':')[0] ?? '0', 10);
  return hour < 12 ? 'AM' : 'PM';
}

function ClassCard({ slot }: { slot: FacultyWeeklyTimetableSlot }) {
  const isActive = slot.isActive ?? false;

  return (
    <View style={[styles.slotCard, isActive && styles.slotCardActive]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.slotMeta, isActive ? styles.slotMetaActive : styles.slotMetaMuted]}>
          {slot.dayLabel}
        </Text>
        {isActive ? (
          <View style={styles.nowBadge}>
            <View style={styles.nowDot} />
            <Text style={styles.nowText}>NOW</Text>
          </View>
        ) : null}
      </View>
      <Text style={[styles.slotTitle, isActive && styles.slotTitleActive]}>{slot.title}</Text>
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <MapPin size={16} color={isActive ? colors.primary : colors.textSecondary} />
          <Text style={styles.metaText}>{slot.room}</Text>
        </View>
        {slot.duration ? (
          <View style={styles.metaItem}>
            <Clock size={16} color={isActive ? colors.primary : colors.textSecondary} />
            <Text style={styles.metaText}>{slot.duration}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function BreakRow({ time }: { time: string }) {
  return (
    <View style={styles.breakRow}>
      <Text style={styles.breakTime}>{time}</Text>
      <View style={styles.breakContent}>
        <View style={styles.breakLine} />
        <View style={styles.breakPill}>
          <Coffee size={14} color="rgba(107,114,128,0.6)" />
          <Text style={styles.breakText}>Short Tea Break</Text>
        </View>
        <View style={styles.breakLine} />
      </View>
    </View>
  );
}

function TimeRow({ group }: { group: TimeGroup }) {
  if (group.isBreak) {
    return <BreakRow time={group.time} />;
  }

  const isActiveRow = group.slots.some((slot) => slot.isActive);

  return (
    <View style={styles.slotRow}>
      <View style={styles.timeCol}>
        <Text style={[styles.timeText, !isActiveRow && styles.timeTextMuted]}>{group.time}</Text>
        <Text style={[styles.periodText, !isActiveRow && styles.periodTextMuted]}>
          {getTimePeriod(group.time)}
        </Text>
      </View>
      <View style={styles.cardsCol}>
        {group.slots.map((slot) => (
          <ClassCard key={slot.id} slot={slot} />
        ))}
      </View>
    </View>
  );
}

export function WeeklyTimetableList({ slots }: WeeklyTimetableListProps) {
  const timeGroups = useMemo(() => groupSlotsByTime(slots), [slots]);

  return (
    <View style={styles.container}>
      <View style={styles.timelineLine} />
      {timeGroups.map((group) => (
        <TimeRow key={group.time} group={group} />
      ))}
    </View>
  );
}

const TIME_COL_WIDTH = 44;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    paddingBottom: spacing.lg,
  },
  timelineLine: {
    position: 'absolute',
    left: TIME_COL_WIDTH,
    top: spacing.lg,
    bottom: spacing.lg,
    width: 1,
    backgroundColor: 'rgba(191,201,196,0.3)',
  },
  slotRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing['2xl'],
    paddingLeft: 0,
  },
  timeCol: {
    width: TIME_COL_WIDTH,
    alignItems: 'flex-end',
    paddingTop: spacing.xs,
  },
  timeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  timeTextMuted: {
    color: 'rgba(25,28,29,0.6)',
  },
  periodText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  periodTextMuted: {
    color: 'rgba(107,114,128,0.6)',
  },
  cardsCol: {
    flex: 1,
    gap: spacing.md,
  },
  slotCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(191,201,196,0.3)',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  slotCardActive: {
    backgroundColor: 'rgba(0,52,43,0.05)',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    borderColor: 'rgba(191,201,196,0.2)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  slotMeta: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  slotMetaActive: {
    color: colors.primary,
  },
  slotMetaMuted: {
    color: 'rgba(107,114,128,0.6)',
  },
  nowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  nowDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.white,
  },
  nowText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  slotTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  slotTitleActive: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  breakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing['2xl'],
  },
  breakTime: {
    width: TIME_COL_WIDTH,
    fontSize: 10,
    fontStyle: 'italic',
    color: 'rgba(107,114,128,0.4)',
    textAlign: 'right',
  },
  breakContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  breakLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(191,201,196,0.2)',
  },
  breakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceContainer,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
  },
  breakText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: 'rgba(107,114,128,0.6)',
  },
});
