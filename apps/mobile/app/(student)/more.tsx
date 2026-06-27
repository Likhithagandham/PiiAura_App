import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import {
  BookOpen,
  Bell,
  GraduationCap,
  ClipboardList,
  User,
  ChevronRight,
  LogOut,
} from 'lucide-react-native';
import { ROUTES } from '@piiaura/constants';
import { useAuth } from '@piiaura/hooks';
import { colors, spacing, typography, radii } from '@piiaura/ui';

const MENU_ITEMS = [
  { id: 'assignments', label: 'Assignments', Icon: ClipboardList, route: ROUTES.STUDENT.ASSIGNMENTS },
  { id: 'grades', label: 'Grades', Icon: GraduationCap, route: ROUTES.STUDENT.GRADES },
  { id: 'announcements', label: 'Announcements', Icon: Bell, route: ROUTES.STUDENT.ANNOUNCEMENTS },
  { id: 'profile', label: 'Profile', Icon: User, route: ROUTES.STUDENT.PROFILE },
] as const;

export default function StudentMoreScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.replace(ROUTES.AUTH.LOGIN);
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.intro}>
          <BookOpen size={28} color={colors.primaryContainer} />
          <Text style={styles.title}>Student Portal</Text>
          <Text style={styles.subtitle}>{user?.className ?? 'Student'}</Text>
        </View>

        <View style={styles.list}>
          {MENU_ITEMS.map((item, index) => (
            <Pressable
              key={item.id}
              style={[styles.row, index < MENU_ITEMS.length - 1 && styles.rowBorder]}
              onPress={() => router.push(item.route as never)}
            >
              <View style={styles.rowLeft}>
                <View style={styles.iconWrap}>
                  <item.Icon size={20} color={colors.primaryContainer} />
                </View>
                <Text style={styles.rowLabel}>{item.label}</Text>
              </View>
              <ChevronRight size={18} color={colors.textSecondary} />
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={20} color={colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing['4xl'],
    gap: spacing['2xl'],
  },
  intro: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primaryContainer,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  list: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radii.xl,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radii.lg,
    backgroundColor: colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: radii.xl,
  },
  logoutText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.error,
  },
});
