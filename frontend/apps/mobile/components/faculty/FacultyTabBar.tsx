import { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { usePathname } from 'expo-router';
import { Home, ClipboardCheck, Calendar, MoreHorizontal } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography, radii } from '@piiaura/ui';
import { WALKTHROUGH_TARGETS } from '@piiaura/constants';
import { getFacultyParentTab } from '@/components/faculty/facultyRouteMeta';
import { WalkthroughTarget, useWalkthrough } from '@/components/walkthrough/WalkthroughProvider';

const TAB_CONFIG = {
  dashboard: { label: 'Home', Icon: Home },
  attendance: { label: 'Attendance', Icon: ClipboardCheck },
  schedule: { label: 'Schedule', Icon: Calendar },
  more: { label: 'More', Icon: MoreHorizontal },
} as const;

type TabRouteName = keyof typeof TAB_CONFIG;

export function FacultyTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const activeTab = getFacultyParentTab(pathname);
  const { isTourActive, remeasureAllTargets } = useWalkthrough();

  useEffect(() => {
    if (!isTourActive) return;
    remeasureAllTargets();
  }, [isTourActive, remeasureAllTargets]);

  return (
    <WalkthroughTarget
      id={WALKTHROUGH_TARGETS.FACULTY.TAB_BAR}
      style={[styles.container, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}
    >
      {state.routes.map((route, index) => {
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
            <View
              style={[
                styles.tabInner,
                isFocused && (route.name === 'more' ? styles.tabInnerMoreActive : styles.tabInnerActive),
              ]}
            >
              <Icon
                size={20}
                color={isFocused && route.name === 'more' ? '#576867' : colors.white}
                strokeWidth={isFocused ? 2.5 : 2}
                fill={isFocused && route.name === 'more' ? '#576867' : 'transparent'}
              />
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
                style={[
                  styles.label,
                  isFocused && styles.labelActive,
                  isFocused && route.name === 'more' && styles.labelMoreActive,
                ]}
              >
                {label}
              </Text>
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
    backgroundColor: colors.primaryContainer,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
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
    paddingHorizontal: spacing.xs,
    borderRadius: radii.full,
    width: '100%',
    maxWidth: '100%',
  },
  tabInnerActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.sm,
  },
  tabInnerMoreActive: {
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: spacing.sm,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: 'rgba(255,255,255,0.72)',
    textAlign: 'center',
    width: '100%',
  },
  labelActive: {
    color: colors.white,
    fontWeight: typography.fontWeight.semibold,
  },
  labelMoreActive: {
    color: '#576867',
  },
});
