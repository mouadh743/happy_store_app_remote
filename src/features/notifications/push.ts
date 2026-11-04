import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect, useRef, useSyncExternalStore } from 'react';
import { AppState, Platform } from 'react-native';

import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { strings } from '@/strings';
import { colors } from '@/theme';

/** Must match `channelId` in supabase/functions/notify-new-order. */
export const ORDERS_CHANNEL = 'orders';

// While the app is open, NewOrderAlerts already shows an in-app banner (from
// Realtime), so skip the system banner but keep the sound and the list entry.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: false,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/** Outcome of the last registration attempt, shown in Settings. */
export type PushStatus =
  | { state: 'checking' }
  | { state: 'registered' }
  | { state: 'unsupported' }
  | { state: 'notConfigured' }
  | { state: 'denied' }
  | { state: 'failed'; step: 'token' | 'save' | 'setup'; message: string };

let status: PushStatus = { state: 'checking' };
const listeners = new Set<() => void>();

function setStatus(next: PushStatus) {
  status = next;
  listeners.forEach((listener) => listener());
}

/** Live push registration status, for the Settings screen. */
export function usePushStatus(): PushStatus {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => status,
  );
}

// Supabase errors are plain objects, not Error instances.
function describeError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && 'message' in error) {
    const { code, message } = error as { code?: string; message?: unknown };
    return code ? `${code}: ${String(message)}` : String(message);
  }
  return String(error);
}

let inFlight: Promise<void> | null = null;

/**
 * Asks for permission and saves this device's Expo push token in
 * `push_tokens`, so the notify-new-order function can reach it.
 * Never throws: a device without push still works as a normal admin app.
 */
function registerForPush(): Promise<void> {
  inFlight ??= doRegister().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

async function doRegister(): Promise<void> {
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') return setStatus({ state: 'unsupported' });
  if (!isSupabaseConfigured) return setStatus({ state: 'notConfigured' });

  let step: 'token' | 'save' | 'setup' = 'setup';
  try {
    // Android 13+ only shows the permission prompt once a channel exists.
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(ORDERS_CHANNEL, {
        name: strings.notifications.channelName,
        importance: AndroidImportance.MAX,
        sound: 'default',
        vibrationPattern: [0, 250, 150, 250],
        lightColor: colors.primary,
      });
    }

    let permission = await Notifications.getPermissionsAsync();
    if (!permission.granted && permission.canAskAgain) {
      permission = await Notifications.requestPermissionsAsync();
    }
    if (!permission.granted) return setStatus({ state: 'denied' });

    step = 'token';
    const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });

    // Insert-only: the app can't read or change other devices' tokens.
    step = 'save';
    // A plain insert, not an upsert: ON CONFLICT needs SELECT on the table,
    // which the app's key deliberately doesn't have (42501). A duplicate (23505)
    // just means this phone registered before.
    const { error } = await supabase.from('push_tokens').insert({ token, platform: Platform.OS });
    if (error && error.code !== '23505') throw error;
    setStatus({ state: 'registered' });
  } catch (error) {
    // Expected in Expo Go on Android and on simulators: no remote push there.
    console.warn(`[push] registration failed at ${step}:`, error);
    setStatus({ state: 'failed', step, message: describeError(error) });
  }
}

/** Registers for push on launch and opens the order when a notification is tapped. */
export function usePushNotifications() {
  useEffect(() => {
    registerForPush();
    // Back from Android/iOS settings (e.g. after allowing notifications):
    // try again, so it works without restarting the app.
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && status.state !== 'registered') registerForPush();
    });
    return () => sub.remove();
  }, []);

  // Covers both taps while running and the tap that cold-started the app.
  const response = Notifications.useLastNotificationResponse();
  const handled = useRef<string | null>(null);
  useEffect(() => {
    if (!response || response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;
    const key = response.notification.request.identifier;
    if (handled.current === key) return;
    handled.current = key;

    const orderId = response.notification.request.content.data?.orderId;
    if (typeof orderId === 'string' && orderId) {
      router.push({ pathname: '/order/[id]', params: { id: orderId } });
    }
  }, [response]);
}
