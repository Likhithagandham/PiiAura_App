import { Tabs } from 'expo-router';
import { StudentChromeHeader } from '@/components/student/StudentChromeHeader';
import { StudentTabBar } from '@/components/student/StudentTabBar';
import { colors } from '@piiaura/ui';

export default function StudentLayout() {
  return (
    <Tabs
      tabBar={(props) => <StudentTabBar {...props} />}
      screenOptions={{
        headerShown: true,
        header: () => <StudentChromeHeader />,
        headerShadowVisible: false,
        headerStatusBarHeight: 0,
        headerStyle: {
          backgroundColor: colors.surface,
          height: undefined,
        },
        tabBarStyle: {
          backgroundColor: '#004D40',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,255,255,0.1)',
        },
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: 'Home' }} />
      <Tabs.Screen name="learn" options={{ title: 'Learn' }} />
      <Tabs.Screen name="timetable" options={{ title: 'Schedule' }} />
      <Tabs.Screen name="more" options={{ title: 'More' }} />
      <Tabs.Screen name="attendance" options={{ href: null }} />
      <Tabs.Screen name="assignments" options={{ href: null }} />
      <Tabs.Screen name="grades" options={{ href: null }} />
      <Tabs.Screen name="announcements" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="homework" options={{ href: null }} />
      <Tabs.Screen name="exams" options={{ href: null }} />
      <Tabs.Screen name="fees" options={{ href: null }} />
      <Tabs.Screen name="leave" options={{ href: null }} />
      <Tabs.Screen name="alerts" options={{ href: null }} />
      <Tabs.Screen name="notices" options={{ href: null }} />
      <Tabs.Screen name="help" options={{ href: null }} />
    </Tabs>
  );
}
