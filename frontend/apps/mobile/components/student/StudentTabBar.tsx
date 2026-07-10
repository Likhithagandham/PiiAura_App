import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { usePathname } from 'expo-router';
import { Home, GraduationCap, Calendar, Menu } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography, radii } from '@piiaura/ui';
import { WALKTHROUGH_TARGETS } from '@piiaura/constants';
import { getStudentParentTab } from '@/components/student/studentRouteMeta';
import { WalkthroughTarget } from '@/components/walkthrough/WalkthroughProvider';

const TAB_CONFIG = {
  dashboard: { label: 'Home', Icon: Home },
  learn: { label: 'Learn', Icon: GraduationCap },
  timetable: { label: 'Schedule', Icon: Calendar },
  more: { label: 'More', Icon: Menu },
} as const;

type TabRouteName = keyof typeof TAB_CONFIG;

const TAB_BAR_BG = '#004D40';

export function StudentTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const activeTab = getStudentParentTab(pathname);

  return (
    <WalkthroughTarget
      id={WALKTHROUGH_TARGETS.STUDENT.TAB_BAR}
      style={[styles.container, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}
    >
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
                size={24}
                color={isFocused ? '#065043' : colors.white}
                strokeWidth={isFocused ? 2.5 : 2}
                fill={isFocused ? '#065043' : 'transparent'}
              />
              <Text style={[styles.label, isFocused && styles.labelActive]}>{label}</Text>
            </View>
          </Pressable>
        );
      })}
    </WalkthroughTarget>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: TAB_BAR_BG,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    minWidth: 0,
    paddingHorizontal: spacing.xs,
  },
  tabInner: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.xl,
    opacity: 0.72,
  },
  tabInnerActive: {
    backgroundColor: '#AFEFDD',
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
    color: '#065043',
  },
});
