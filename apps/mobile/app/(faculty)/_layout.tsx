import { Tabs } from 'expo-router';
import { FacultyChromeHeader } from '@/components/faculty/FacultyChromeHeader';
import { FacultyTabBar } from '@/components/faculty/FacultyTabBar';
import { colors } from '@piiaura/ui';

export default function FacultyLayout() {
  return (
    <Tabs
      tabBar={(props) => <FacultyTabBar {...props} />}
      screenOptions={{
        headerShown: true,
        header: () => <FacultyChromeHeader />,
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
      <Tabs.Screen name="schedule" options={{ title: 'Schedule' }} />
      <Tabs.Screen name="more" options={{ title: 'More' }} />
      <Tabs.Screen name="assignments" options={{ href: null }} />
      <Tabs.Screen name="students" options={{ href: null }} />
      <Tabs.Screen name="announcements" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="leave" options={{ href: null }} />
      <Tabs.Screen name="study-material" options={{ href: null }} />
      <Tabs.Screen name="ai-tools" options={{ href: null }} />
      <Tabs.Screen name="marks-entry" options={{ href: null }} />
      <Tabs.Screen name="syllabus" options={{ href: null }} />
      <Tabs.Screen name="invigilation" options={{ href: null }} />
      <Tabs.Screen name="salary" options={{ href: null }} />
      <Tabs.Screen name="help-support" options={{ href: null }} />
    </Tabs>
  );
}
