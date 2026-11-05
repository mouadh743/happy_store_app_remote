import { router, useLocalSearchParams } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { ActivityIndicator, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut, LinearTransition } from 'react-native-reanimated';

import { EmptyState } from '@/components/EmptyState';
import { BackIcon, OrdersIcon } from '@/components/icons';
import { PressableScale } from '@/components/PressableScale';
import { Screen } from '@/components/Screen';
import {
  customerName,
  NotAllowedError,
  orderCode,
  useOrder,
  useUpdateOrderStatus,
  type OrderDetail,
} from '@/features/orders/api';
import { isOrderStatus, type OrderStatus } from '@/features/orders/status';
import { StatusPicker } from '@/features/orders/StatusPicker';
import { StatusPill } from '@/features/orders/StatusPill';
import { formatMoney, formatOrderDate } from '@/format';
import { strings } from '@/strings';
import { colors, radius, spacing, TOUCH_TARGET, type } from '@/theme';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const orderId = typeof id === 'string' ? id : '';
  const { data: order, isPending, isError, refetch } = useOrder(orderId);

  let body: ReactNode;
  if (isPending) {
    body = (
      <Animated.View entering={FadeIn.delay(150)} style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
      </Animated.View>
    );
  } else if (isError || !order) {
    body = (
      <View style={styles.centered}>
        <EmptyState
          icon={<OrdersIcon color={colors.primary} size={28} />}
          title={isError ? strings.detail.loadError : strings.detail.notFound}
          action={isError ? { label: strings.orders.retry, onPress: () => refetch() } : undefined}
        />
      </View>
    );
  } else {
    body = <OrderBody order={order} />;
  }

  return (
    <Screen padded={false}>
      <View style={styles.topBar}>
        <PressableScale
          scaleTo={0.9}
          containerStyle={styles.backContainer}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          accessibilityRole="button"
          accessibilityLabel={strings.detail.back}
          hitSlop={8}
          style={({ pressed }) => [styles.backButton, pressed && styles.backPressed]}>
          <BackIcon color={colors.text} />
        </PressableScale>
      </View>
      {body}
    </Screen>
  );
}

function OrderBody({ order }: { order: OrderDetail }) {
  const current = isOrderStatus(order.status) ? order.status : null;
  // Draft selection; null means "same as the saved status".
  const [draft, setDraft] = useState<OrderStatus | null>(null);
  const selected = draft ?? current;
  const update = useUpdateOrderStatus();
  const dirty = selected !== null && selected !== current;

  const save = () => {
    if (!selected || !dirty) return;
    update.mutate(
      { id: order.id, status: selected },
      { onSuccess: () => setDraft(null) },
    );
  };

  const items = Array.isArray(order.items) ? order.items : [];
  const hasAddress = Boolean(order.governorate?.trim() || order.city?.trim());
  const deliveryFee = Number(order.delivery_fee ?? 0);
  const phone = order.phone?.trim();

  let feedback: ReactNode = null;
  if (update.isError) {
    const notAllowed = update.error instanceof NotAllowedError;
    feedback = (
      <Banner tone="error">{notAllowed ? strings.detail.notAllowed : strings.detail.saveFailed}</Banner>
    );
  } else if (update.isSuccess && !dirty) {
    feedback = <Banner tone="success">{strings.detail.saved}</Banner>;
  }

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Animated.View entering={FadeInDown.duration(260)} style={styles.header}>
        <Text style={styles.title} accessibilityRole="header">
          {strings.detail.titlePrefix}
          {orderCode(order)}
        </Text>
        <StatusPill status={order.status} />
      </Animated.View>
      <Animated.Text entering={FadeInDown.duration(260).delay(30)} style={styles.meta}>
        {strings.detail.placed} {formatOrderDate(order.created_at)}
      </Animated.Text>

      <Section index={1} title={strings.detail.customer}>
        <Card>
          <Row label={strings.detail.name} value={customerName(order) || strings.orders.noName} />
          {phone ? (
            <Row
              label={strings.detail.phone}
              value={phone}
              onPress={() => Linking.openURL(`tel:${phone.replace(/\s+/g, '')}`)}
              accessibilityHint={strings.detail.callHint}
            />
          ) : null}
          {order.email?.trim() ? <Row label={strings.detail.email} value={order.email.trim()} /> : null}
          {order.payment_method?.trim() ? (
            <Row label={strings.detail.payment} value={order.payment_method.trim()} />
          ) : null}
        </Card>
      </Section>

      {hasAddress ? (
        <Section index={2} title={strings.detail.delivery}>
          <Card>
            {order.governorate?.trim() ? (
              <Row label={strings.detail.governorate} value={order.governorate.trim()} />
            ) : null}
            {order.city?.trim() ? <Row label={strings.detail.city} value={order.city.trim()} /> : null}
          </Card>
        </Section>
      ) : null}

      <Section index={3} title={strings.detail.items}>
        <Card>
          {items.map((item, i) => (
            <Row
              key={item.slug ?? i}
              label={item.name?.trim() || strings.detail.unknownItem}
              value={formatMoney(item.price)}
            />
          ))}
          {order.product?.trim() ? <Row label={strings.detail.product} value={order.product.trim()} /> : null}
          {order.quantity != null ? <Row label={strings.detail.quantity} value={String(order.quantity)} /> : null}
          <Row
            label={strings.detail.deliveryFee}
            value={deliveryFee > 0 ? formatMoney(deliveryFee) : strings.detail.free}
          />
          <Row label={strings.detail.total} value={formatMoney(order.total)} strong />
        </Card>
      </Section>

      {order.note?.trim() ? (
        <Section index={4} title={strings.detail.note}>
          <Card>
            <Text style={styles.note}>{order.note.trim()}</Text>
          </Card>
        </Section>
      ) : null}

      <Section index={5} title={strings.detail.updateStatus}>
        <StatusPicker
          value={selected}
          onChange={(status) => {
            update.reset();
            setDraft(status);
          }}
          disabled={update.isPending}
        />
        {feedback}
        <PressableScale
          onPress={save}
          disabled={!dirty || update.isPending}
          accessibilityRole="button"
          accessibilityState={{ disabled: !dirty || update.isPending, busy: update.isPending }}
          style={({ pressed }) => [
            styles.saveButton,
            (!dirty || update.isPending) && styles.saveDisabled,
            pressed && styles.savePressed,
          ]}>
          <Text style={styles.saveLabel}>{update.isPending ? strings.detail.saving : strings.detail.save}</Text>
        </PressableScale>
      </Section>
    </ScrollView>
  );
}

/** `index` sets its place in the screen's entrance cascade. */
function Section({ title, index, children }: { title: string; index: number; children: ReactNode }) {
  return (
    <Animated.View
      entering={FadeInDown.duration(300).delay(index * 50)}
      // Slides the save button down smoothly when a banner appears above it.
      layout={LinearTransition.duration(200)}
      style={styles.section}>
      <Text style={styles.sectionTitle} accessibilityRole="header">
        {title}
      </Text>
      {children}
    </Animated.View>
  );
}

function Card({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

type RowProps = {
  label: string;
  value: string;
  strong?: boolean;
  /** Makes the value a link (e.g. tap the phone number to call). */
  onPress?: () => void;
  accessibilityHint?: string;
};

function Row({ label, value, strong, onPress, accessibilityHint }: RowProps) {
  const labelNode = (
    <Text style={[styles.rowLabel, strong && styles.rowStrong]} numberOfLines={2}>
      {label}
    </Text>
  );
  if (onPress) {
    return (
      <PressableScale
        scaleTo={0.98}
        onPress={onPress}
        accessibilityRole="link"
        accessibilityLabel={`${label}: ${value}`}
        accessibilityHint={accessibilityHint}
        style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
        {labelNode}
        <Text style={[styles.rowValue, styles.rowLink]}>{value}</Text>
      </PressableScale>
    );
  }
  return (
    <View style={styles.row}>
      {labelNode}
      <Text style={[styles.rowValue, strong && styles.rowStrong]} selectable>
        {value}
      </Text>
    </View>
  );
}

function Banner({ tone, children }: { tone: 'success' | 'error'; children: ReactNode }) {
  const bg = tone === 'success' ? colors.successBg : colors.errorBg;
  const fg = tone === 'success' ? colors.successText : colors.errorText;
  return (
    <Animated.View
      entering={FadeInDown.duration(220)}
      exiting={FadeOut.duration(150)}
      style={[styles.banner, { backgroundColor: bg }]}
      accessibilityLiveRegion="polite">
      <Text style={[styles.bannerText, { color: fg }]}>{children}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  topBar: { paddingHorizontal: spacing.screen, marginBottom: 4 },
  backContainer: { alignSelf: 'flex-start' },
  backButton: {
    width: TOUCH_TARGET,
    height: TOUCH_TARGET,
    borderRadius: TOUCH_TARGET / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginStart: -10,
  },
  backPressed: { backgroundColor: colors.primarySoft },
  centered: { flex: 1, justifyContent: 'center', padding: spacing.screen, paddingBottom: 64 },
  content: { padding: spacing.screen, paddingTop: 4, paddingBottom: 40, gap: 6 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  title: { ...type.detailTitle, color: colors.text, flexShrink: 1 },
  meta: { ...type.body, color: colors.textMuted },
  section: { marginTop: 18, gap: 10 },
  sectionTitle: { ...type.sectionTitle, color: colors.text },
  card: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  rowLabel: { ...type.body, flex: 1, color: colors.textMuted },
  rowValue: { ...type.body, color: colors.text, textAlign: 'right', flexShrink: 1 },
  rowStrong: { ...type.bodyStrong, color: colors.text },
  rowLink: { color: colors.primary, fontWeight: '600' },
  rowPressed: { opacity: 0.6 },
  note: { ...type.body, lineHeight: 20, color: colors.text, paddingVertical: 10 },
  banner: { borderRadius: radius.control, paddingHorizontal: 14, paddingVertical: 12 },
  bannerText: { ...type.body, fontWeight: '600' },
  saveButton: {
    minHeight: TOUCH_TARGET + 6,
    borderRadius: radius.control,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  saveDisabled: { opacity: 0.45 },
  savePressed: { opacity: 0.85 },
  saveLabel: { ...type.button, color: colors.onPrimary },
});
