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
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: 'Home' }} />
      <Tabs.Screen name="attendance" options={{ title: 'Attendance' }} />
      <Tabs.Screen name="timetable" options={{ title: 'Schedule' }} />
      <Tabs.Screen name="more" options={{ title: 'More' }} />
      <Tabs.Screen name="assignments" options={{ href: null }} />
      <Tabs.Screen name="grades" options={{ href: null }} />
      <Tabs.Screen name="announcements" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
    </Tabs>
  );
}
