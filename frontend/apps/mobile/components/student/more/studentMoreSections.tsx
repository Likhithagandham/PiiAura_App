import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import {
  GraduationCap,
  ClipboardList,
  FileQuestion,
  Wallet,
  CalendarX,
  Megaphone,
  BellRing,
  HelpCircle,
  LogOut,
  ChevronRight,
  UserCircle,
  BookOpen,
  BadgePercent,
  CalendarCheck,
  type LucideIcon,
} from 'lucide-react-native';
import { ROUTES } from '@piiaura/constants';
import type { StudentMoreHubTile, StudentMoreSystemItem } from '@piiaura/types';
import { colors, spacing, typography, radii } from '@piiaura/ui';

const ACADEMIC_ICONS: Record<string, LucideIcon> = {
  homework: ClipboardList,
  exams: FileQuestion,
  grades: BadgePercent,
  assignments: ClipboardList,
  attendance: CalendarCheck,
  learn: BookOpen,
};

const CAMPUS_ICONS: Record<string, LucideIcon> = {
  fees: Wallet,
  leave: CalendarX,
  notices: Megaphone,
  alerts: BellRing,
};

const SYSTEM_ICONS: Record<string, LucideIcon> = {
  account: UserCircle,
  help: HelpCircle,
  logout: LogOut,
};

const TILE_ROUTES: Record<string, string | undefined> = {
  homework: ROUTES.STUDENT.HOMEWORK,
  exams: ROUTES.STUDENT.EXAMS,
  grades: ROUTES.STUDENT.GRADES,
  assignments: ROUTES.STUDENT.ASSIGNMENTS,
  attendance: ROUTES.STUDENT.ATTENDANCE,
  learn: ROUTES.STUDENT.LEARN,
  fees: ROUTES.STUDENT.FEES,
  leave: ROUTES.STUDENT.LEAVE,
  notices: ROUTES.STUDENT.NOTICES,
  alerts: ROUTES.STUDENT.ALERTS,
};

const SYSTEM_ROUTES: Record<string, string | undefined> = {
  account: ROUTES.STUDENT.PROFILE,
  help: ROUTES.STUDENT.HELP,
};

export function navigateStudentPortal(route?: string) {
  if (route) {
    router.push(route as never);
  }
}

interface StudentMoreHeroBannerProps {
  title: string;
  description: string;
}

export function StudentMoreHeroBanner({ title, description }: StudentMoreHeroBannerProps) {
  return (
    <View style={styles.hero}>
      <View style={styles.heroDecor}>
        <GraduationCap size={96} color="rgba(255,255,255,0.2)" />
      </View>
      <View style={styles.heroContent}>
        <Text style={styles.heroTitle}>{title}</Text>
        <Text style={styles.heroDescription}>{description}</Text>
      </View>
    </View>
  );
}

interface StudentMoreModuleGridProps {
  title: string;
  tiles: StudentMoreHubTile[];
  variant: 'academic' | 'campus';
  onTilePress: (tile: StudentMoreHubTile) => void;
}

export function StudentMoreModuleGrid({
  title,
  tiles,
  variant,
  onTilePress,
}: StudentMoreModuleGridProps) {
  const iconMap = variant === 'academic' ? ACADEMIC_ICONS : CAMPUS_ICONS;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.grid}>
        {(tiles ?? []).map((tile) => {
          const Icon = iconMap[tile.id] ?? ClipboardList;
          const iconWrapStyle =
            variant === 'academic' ? styles.tileIconAcademic : styles.tileIconCampus;

          return (
            <Pressable
              key={tile.id}
              style={styles.tile}
              onPress={() => onTilePress(tile)}
              accessibilityRole="button"
              accessibilityLabel={`${tile.label}, ${tile.subtitle}`}
            >
              <View style={iconWrapStyle}>
                <Icon size={22} color={colors.primaryContainer} />
              </View>
              <Text style={styles.tileLabel}>{tile.label}</Text>
              <Text style={styles.tileSubtitle}>{tile.subtitle}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

interface StudentMoreSystemListProps {
  title: string;
  items: StudentMoreSystemItem[];
  onItemPress: (item: StudentMoreSystemItem) => void;
}

export function StudentMoreSystemList({ title, items, onItemPress }: StudentMoreSystemListProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.systemList}>
        {(items ?? []).map((item, index) => {
          const Icon = SYSTEM_ICONS[item.id] ?? HelpCircle;
          const isLogout = item.id === 'logout';
          const isLast = index === (items?.length ?? 0) - 1;

          return (
            <Pressable
              key={item.id}
              style={[styles.systemRow, !isLast && styles.systemRowBorder]}
              onPress={() => onItemPress(item)}
            >
              <View style={styles.systemLeft}>
                <Icon size={22} color={isLogout ? '#BA1A1A' : colors.textSecondary} />
                <Text style={[styles.systemLabel, isLogout && styles.systemLabelDanger]}>
                  {item.label}
                </Text>
              </View>
              <ChevronRight size={18} color={isLogout ? '#BA1A1A' : colors.textSecondary} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function getStudentMoreTileRoute(tileId: string): string | undefined {
  return TILE_ROUTES[tileId];
}

export function getStudentMoreSystemRoute(itemId: string): string | undefined {
  return SYSTEM_ROUTES[itemId];
}

const styles = StyleSheet.create({
  hero: {
    height: 160,
    borderRadius: radii.xl,
    backgroundColor: colors.primaryContainer,
    padding: spacing['2xl'],
    justifyContent: 'flex-end',
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  heroDecor: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    opacity: 0.9,
  },
  heroContent: {
    gap: spacing.xs,
    zIndex: 1,
  },
  heroTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  heroDescription: {
    fontSize: typography.fontSize.md,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: typography.fontSize.md * 1.4,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  tile: {
    width: '47.5%',
    flexGrow: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.xl,
    padding: spacing.lg,
    alignItems: 'flex-start',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  tileIconAcademic: {
    padding: spacing.sm,
    backgroundColor: colors.secondaryContainer,
    borderRadius: radii.lg,
    marginBottom: spacing.md,
  },
  tileIconCampus: {
    padding: spacing.sm,
    backgroundColor: colors.surfaceContainer,
    borderRadius: radii.lg,
    marginBottom: spacing.md,
  },
  tileLabel: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  tileSubtitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  systemList: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.xl,
    overflow: 'hidden',
  },
  systemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  systemRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  systemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  systemLabel: {
    fontSize: typography.fontSize.lg,
    color: colors.text,
  },
  systemLabelDanger: {
    color: '#BA1A1A',
  },
});
