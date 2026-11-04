import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { PressableScale } from '@/components/PressableScale';
import { orderCode, type OrderSummary } from '@/features/orders/api';
import { statusLabel } from '@/features/orders/status';
import { StatusPill } from '@/features/orders/StatusPill';
import { formatMoney, formatOrderDate } from '@/format';
import { strings } from '@/strings';
import { colors, radius, type } from '@/theme';

/** One row of the orders list: customer, number and date on the left; total and status on the right. Tap to open. */
export function OrderCard({ order }: { order: OrderSummary }) {
  const name = order.customer_name?.trim() || strings.orders.noName;
  const code = orderCode(order);
  const date = formatOrderDate(order.created_at);
  const total = formatMoney(order.total);

  return (
    <PressableScale
      onPress={() => router.push({ pathname: '/order/[id]', params: { id: order.id } })}
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${code}, ${date}, ${total}, ${statusLabel(order.status)}`}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
      <View style={styles.main}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {code} · {date}
        </Text>
      </View>
      <View style={styles.side}>
        <Text style={styles.amount}>{total}</Text>
        <StatusPill status={order.status} />
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cardPressed: { backgroundColor: colors.primarySoft },
  main: { flex: 1, gap: 4 },
  side: { alignItems: 'flex-end', gap: 6 },
  name: { ...type.cardTitle, color: colors.text },
  meta: { ...type.meta, color: colors.textMuted },
  amount: { ...type.amount, color: colors.text },
});
