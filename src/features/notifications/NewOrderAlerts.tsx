import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CloseIcon, OrdersIcon } from '@/components/icons';
import { PressableScale } from '@/components/PressableScale';
import { orderCode, ordersKeys, type OrderSummary } from '@/features/orders/api';
import { formatMoney } from '@/format';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { strings } from '@/strings';
import { colors, radius, spacing, TOUCH_TARGET, type } from '@/theme';

const VISIBLE_MS = 6000;

/**
 * While the app is open: listens for new orders over Supabase Realtime,
 * refreshes the list and drops a banner from the top. Tap it to open the order.
 * (When the app is closed, the push notification does this job.)
 */
export function NewOrderAlerts() {
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const [order, setOrder] = useState<OrderSummary | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const channel = supabase
      .channel('admin-new-orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        queryClient.invalidateQueries({ queryKey: ordersKeys.list() });
        setOrder(payload.new as OrderSummary);
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Auto-hide; a newer order restarts the timer.
  useEffect(() => {
    if (!order) return;
    const timer = setTimeout(() => setOrder(null), VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [order]);

  if (!order) return null;

  const open = () => {
    setOrder(null);
    router.push({ pathname: '/order/[id]', params: { id: order.id } });
  };

  return (
    <Animated.View
      key={order.id}
      entering={FadeInUp.springify().damping(18).stiffness(200)}
      exiting={FadeOutUp.duration(200)}
      pointerEvents="box-none"
      style={[styles.wrap, { top: insets.top + 8 }]}>
      <PressableScale
        onPress={open}
        accessibilityRole="button"
        accessibilityLabel={`${strings.notifications.newOrder} ${orderCode(order)}. ${strings.notifications.view}`}
        accessibilityLiveRegion="polite"
        style={styles.toast}>
        <View style={styles.icon}>
          <OrdersIcon color={colors.onPrimary} size={20} />
        </View>
        <View style={styles.text}>
          <Text style={styles.title} numberOfLines={1}>
            {strings.notifications.newOrder} · {orderCode(order)}
          </Text>
          <Text style={styles.body} numberOfLines={1}>
            {order.customer_name?.trim() || strings.orders.noName} · {formatMoney(order.total)}
          </Text>
        </View>
        <Pressable
          onPress={() => setOrder(null)}
          accessibilityRole="button"
          accessibilityLabel={strings.notifications.dismiss}
          hitSlop={8}
          style={styles.close}>
          <CloseIcon color={colors.textMuted} size={18} />
        </Pressable>
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: spacing.screen, right: spacing.screen, zIndex: 100 },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: radius.card + 4,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    boxShadow: '0 8px 24px rgba(26, 29, 35, 0.16)',
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  text: { flex: 1, gap: 2 },
  title: { ...type.bodyStrong, color: colors.text },
  body: { ...type.body, color: colors.textMuted },
  close: {
    width: TOUCH_TARGET - 8,
    height: TOUCH_TARGET - 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
