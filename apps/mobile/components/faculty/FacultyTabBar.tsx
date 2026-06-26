import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Home, ClipboardCheck, Calendar, MoreHorizontal } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography, radii } from '@piiaura/ui';

const TAB_CONFIG = {
  dashboard: { label: 'Home', Icon: Home },
  attendance: { label: 'Attendance', Icon: ClipboardCheck },
  schedule: { label: 'Schedule', Icon: Calendar },
  more: { label: 'More', Icon: MoreHorizontal },
} as const;

type TabRouteName = keyof typeof TAB_CONFIG;

export function FacultyTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      {state.routes.map((route, index) => {
        const config = TAB_CONFIG[route.name as TabRouteName];
        if (!config) return null;

        const isFocused = state.index === index;
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
    </View>
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
  },
  tabInner: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radii.full,
    minWidth: 70,
  },
  tabInnerActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.xl,
    minWidth: 96,
  },
  tabInnerMoreActive: {
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: spacing.xl,
    minWidth: 96,
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
  },
  labelActive: {
    color: colors.white,
    fontWeight: typography.fontWeight.semibold,
  },
  labelMoreActive: {
    color: '#576867',
  },
});
