import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { configureApiBaseUrl } from '@piiaura/api';
import { APP_CONFIG } from '@piiaura/constants';
import { ToastProvider } from '@/components/toast/ToastProvider';

const apiUrl = process.env.EXPO_PUBLIC_API_URL;
if (apiUrl) {
  configureApiBaseUrl(apiUrl);
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: APP_CONFIG.QUERY_STALE_TIME_MS,
      retry: 1,
    },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="dark" />
      <ToastProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(faculty)" />
          <Stack.Screen name="(student)" />
        </Stack>
      </ToastProvider>
    </QueryClientProvider>
  );
}
