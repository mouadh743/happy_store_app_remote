import { Tabs } from 'expo-router/js-tabs';

import { OrdersIcon, SettingsIcon } from '@/components/icons';
import { strings } from '@/strings';
import { colors } from '@/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        sceneStyle: { backgroundColor: colors.background },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: strings.tabs.orders,
          tabBarIcon: ({ color }) => <OrdersIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: strings.tabs.settings,
          tabBarIcon: ({ color }) => <SettingsIcon color={color} />,
        }}
      />
    </Tabs>
  );
}
