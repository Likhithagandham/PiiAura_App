import { Stack } from 'expo-router';

export default function StudentLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="timetable" />
      <Stack.Screen name="attendance" />
      <Stack.Screen name="assignments" />
      <Stack.Screen name="grades" />
      <Stack.Screen name="announcements" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}
