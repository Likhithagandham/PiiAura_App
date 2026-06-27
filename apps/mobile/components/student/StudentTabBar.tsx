import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { usePathname } from 'expo-router';
import { Home, ClipboardCheck, Calendar, Menu } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography, radii } from '@piiaura/ui';
import { getStudentParentTab } from '@/components/student/studentRouteMeta';

const TAB_CONFIG = {
  dashboard: { label: 'Home', Icon: Home },
  attendance: { label: 'Attendance', Icon: ClipboardCheck },
  timetable: { label: 'Schedule', Icon: Calendar },
  more: { label: 'More', Icon: Menu },
} as const;

type TabRouteName = keyof typeof TAB_CONFIG;

const TAB_BAR_BG = '#00332b';

export function StudentTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const activeTab = getStudentParentTab(pathname);

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      {state.routes.map((route) => {
        const config = TAB_CONFIG[route.name as TabRouteName];
        if (!config) return null;

        const isFocused = route.name === activeTab;
        const { Icon, label } = config;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <Pressable key={route.key} onPress={onPress} style={styles.tab}>
            <View style={[styles.tabInner, isFocused && styles.tabInnerActive]}>
              <Icon
                size={22}
                color={isFocused ? colors.primaryContainer : colors.white}
                strokeWidth={isFocused ? 2.5 : 2}
                fill={isFocused ? colors.primaryContainer : 'transparent'}
              />
              <Text style={[styles.label, isFocused && styles.labelActive]}>{label}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: TAB_BAR_BG,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.primaryContainer,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    minWidth: 0,
  },
  tabInner: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.xl,
    opacity: 0.72,
  },
  tabInnerActive: {
    backgroundColor: '#F0FDFA',
    opacity: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  labelActive: {
    color: colors.primaryContainer,
  },
});
