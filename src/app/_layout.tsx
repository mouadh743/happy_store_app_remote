import { QueryClientProvider } from '@tanstack/react-query';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';

import { NewOrderAlerts } from '@/features/notifications/NewOrderAlerts';
import { usePushNotifications } from '@/features/notifications/push';
import { queryClient } from '@/lib/queryClient';
import { colors } from '@/theme';

// New-order alerts (banner + push) are for the phone app only, never the web
// build. The store website shares the database but has no alert code at all.
const isNativeApp = Platform.OS === 'ios' || Platform.OS === 'android';

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
  },
};

export default function RootLayout() {
  usePushNotifications();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={navigationTheme}>
        <StatusBar style="dark" />
        {/* Screens draw their own headers to match the mockup. */}
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
        {/* Above every screen: banner for orders that arrive while the app is open. */}
        {isNativeApp ? <NewOrderAlerts /> : null}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
