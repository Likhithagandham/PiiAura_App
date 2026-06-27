import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import {
  FileText,
  ClipboardList,
  IdCard,
  LineChart,
  CalendarX,
  Wallet,
  PenSquare,
  BellRing,
  Sparkles,
  ChevronRight,
  Settings,
  HelpCircle,
  LogOut,
  Brain,
  type LucideIcon,
} from 'lucide-react-native';
import { ROUTES } from '@piiaura/constants';
import { colors, spacing, typography, radii } from '@piiaura/ui';

export interface FacultyModuleItem {
  id: string;
  label: string;
  Icon: LucideIcon;
  route?: string;
  badge?: number;
}

export interface FacultySystemItem {
  id: string;
  label: string;
  Icon: LucideIcon;
  route?: string;
  destructive?: boolean;
}

export const FACULTY_ACADEMIC_MODULES: FacultyModuleItem[] = [
  { id: 'study-material', label: 'Study Material', Icon: FileText, route: ROUTES.FACULTY.STUDY_MATERIAL },
  {
    id: 'assignments',
    label: 'Assignments',
    Icon: ClipboardList,
    route: ROUTES.FACULTY.ASSIGNMENTS,
  },
  { id: 'invigilation', label: 'Invigilation', Icon: IdCard, route: ROUTES.FACULTY.INVIGILATION },
  { id: 'syllabus', label: 'Syllabus Progress', Icon: LineChart, route: ROUTES.FACULTY.SYLLABUS },
];

export const FACULTY_ADMIN_MODULES: FacultyModuleItem[] = [
  { id: 'leave', label: 'My Leave', Icon: CalendarX, route: ROUTES.FACULTY.LEAVE },
  { id: 'salary', label: 'My Salary', Icon: Wallet, route: ROUTES.FACULTY.SALARY },
  { id: 'marks', label: 'Marks Entry', Icon: PenSquare, route: ROUTES.FACULTY.MARKS_ENTRY },
  {
    id: 'alerts',
    label: 'Alerts',
    Icon: BellRing,
    route: ROUTES.FACULTY.ANNOUNCEMENTS,
    badge: 3,
  },
];

export const FACULTY_SYSTEM_ITEMS: FacultySystemItem[] = [
  {
    id: 'settings',
    label: 'Settings',
    Icon: Settings,
    route: ROUTES.FACULTY.SETTINGS,
  },
  { id: 'help', label: 'Help & Support', Icon: HelpCircle, route: ROUTES.FACULTY.HELP },
  { id: 'logout', label: 'Logout', Icon: LogOut, destructive: true },
];

export function navigateFacultyPortal(route?: string) {
  if (route) {
    router.push(route as never);
  }
}

export function FacultyAiAssistantCard({ onPress }: { onPress?: () => void }) {
  return (
    <Pressable style={styles.aiCard} onPress={onPress}>
      <View style={styles.aiGradient} />
      <View style={styles.aiBrainDecor}>
        <Brain size={100} color="rgba(255,255,255,0.1)" />
      </View>
      <View style={styles.aiContent}>
        <View style={styles.aiLeft}>
          <View style={styles.aiIconWrap}>
            <Sparkles size={28} color="#AFEFDD" />
          </View>
          <View style={styles.aiText}>
            <View style={styles.aiTitleRow}>
              <Text style={styles.aiTitle}>AI Assistant</Text>
              <View style={styles.proBadge}>
                <Text style={styles.proBadgeText}>Pro</Text>
              </View>
            </View>
            <Text style={styles.aiSubtitle}>Generate lesson plans & resources instantly</Text>
          </View>
        </View>
        <ChevronRight size={18} color="rgba(255,255,255,0.6)" />
      </View>
    </Pressable>
  );
}

interface ModuleSectionProps {
  title: string;
  moduleCount: number;
  items: FacultyModuleItem[];
  variant: 'academic' | 'admin';
  onItemPress: (item: FacultyModuleItem) => void;
}

export function FacultyModuleSection({
  title,
  moduleCount,
  items,
  variant,
  onItemPress,
}: ModuleSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionCount}>{moduleCount} Modules</Text>
      </View>
      <View style={styles.moduleGrid}>
        {items.map((item) => (
          <Pressable
            key={item.id}
            style={styles.moduleTile}
            onPress={() => onItemPress(item)}
          >
            <View
              style={[
                styles.moduleIconWrap,
                variant === 'academic' ? styles.moduleIconAcademic : styles.moduleIconAdmin,
              ]}
            >
              <item.Icon
                size={22}
                color={variant === 'academic' ? colors.primaryContainer : '#576867'}
              />
            </View>
            <Text style={styles.moduleLabel}>{item.label}</Text>
            {item.badge ? (
              <View style={styles.alertBadge}>
                <Text style={styles.alertBadgeText}>{item.badge}</Text>
              </View>
            ) : null}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

interface SystemListProps {
  items: FacultySystemItem[];
  onItemPress: (item: FacultySystemItem) => void;
}

export function FacultySystemList({ items, onItemPress }: SystemListProps) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, styles.systemSectionTitle]}>System</Text>
      <View style={styles.systemList}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const { Icon, label, destructive } = item;

          return (
            <Pressable
              key={item.id}
              style={[
                styles.systemItem,
                !isLast && styles.systemItemBorder,
                destructive && styles.systemItemDestructive,
              ]}
              onPress={() => onItemPress(item)}
            >
              <View style={styles.systemLeft}>
                <View
                  style={[
                    styles.systemIconWrap,
                    destructive && styles.systemIconDestructive,
                  ]}
                >
                  <Icon
                    size={20}
                    color={destructive ? colors.error : colors.textSecondary}
                  />
                </View>
                <Text style={[styles.systemLabel, destructive && styles.systemLabelDestructive]}>
                  {label}
                </Text>
              </View>
              {destructive ? (
                <LogOut size={18} color="rgba(186,26,26,0.4)" />
              ) : (
                <ChevronRight size={18} color="rgba(112,121,117,0.5)" />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const tertiaryFixed = '#FFDCC2';
const onTertiaryFixed = '#2E1500';

const styles = StyleSheet.create({
  aiCard: {
    borderRadius: radii.xl,
    padding: spacing.lg,
    overflow: 'hidden',
    backgroundColor: colors.primary,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: 'rgba(175,239,221,0.3)',
  },
  aiGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.primaryContainer,
    opacity: 0.5,
  },
  aiBrainDecor: {
    position: 'absolute',
    right: -24,
    bottom: -24,
    transform: [{ rotate: '12deg' }],
  },
  aiContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  aiLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  aiIconWrap: {
    width: 48,
    height: 48,
    borderRadius: radii.xl,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiText: {
    flex: 1,
    gap: spacing.xs,
  },
  aiTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  aiTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
    letterSpacing: -0.3,
  },
  proBadge: {
    backgroundColor: tertiaryFixed,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  proBadgeText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: onTertiaryFixed,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  aiSubtitle: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  section: {
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: '#516161',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  systemSectionTitle: {
    marginLeft: spacing.xs,
    marginBottom: 0,
  },
  sectionCount: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    textTransform: 'uppercase',
  },
  moduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  moduleTile: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(191,201,196,0.3)',
    padding: spacing.lg,
    gap: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
    position: 'relative',
  },
  moduleIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleIconAcademic: {
    backgroundColor: 'rgba(0,77,64,0.1)',
  },
  moduleIconAdmin: {
    backgroundColor: 'rgba(212,230,229,0.3)',
  },
  moduleLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    lineHeight: typography.fontSize.md * 1.25,
  },
  alertBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: colors.error,
    minWidth: 20,
    height: 20,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  alertBadgeText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  systemList: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(191,201,196,0.3)',
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  systemItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    backgroundColor: colors.surface,
  },
  systemItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(191,201,196,0.1)',
  },
  systemItemDestructive: {
    backgroundColor: 'rgba(186,26,26,0.02)',
  },
  systemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  systemIconWrap: {
    width: 32,
    height: 32,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  systemIconDestructive: {
    backgroundColor: 'rgba(186,26,26,0.1)',
  },
  systemLabel: {
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  systemLabelDestructive: {
    fontWeight: typography.fontWeight.bold,
    color: colors.error,
  },
});
