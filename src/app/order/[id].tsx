import { router, useLocalSearchParams } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut, LinearTransition } from 'react-native-reanimated';

import { EmptyState } from '@/components/EmptyState';
import { BackIcon, OrdersIcon } from '@/components/icons';
import { PressableScale } from '@/components/PressableScale';
import { Screen } from '@/components/Screen';
import {
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
          <Row label={strings.detail.customer} value={order.customer_name?.trim() || strings.orders.noName} />
          {order.phone ? <Row label={strings.detail.phone} value={order.phone} /> : null}
          {order.email ? <Row label={strings.detail.email} value={order.email} /> : null}
          {order.payment_method ? <Row label={strings.detail.payment} value={order.payment_method} /> : null}
        </Card>
      </Section>

      <Section index={2} title={strings.detail.items}>
        <Card>
          {items.map((item, i) => (
            <Row
              key={item.slug ?? i}
              label={item.name?.trim() || strings.detail.unknownItem}
              value={formatMoney(item.price)}
            />
          ))}
          <Row label={strings.detail.total} value={formatMoney(order.total)} strong />
        </Card>
      </Section>

      {order.note?.trim() ? (
        <Section index={3} title={strings.detail.note}>
          <Card>
            <Text style={styles.note}>{order.note.trim()}</Text>
          </Card>
        </Section>
      ) : null}

      <Section index={4} title={strings.detail.updateStatus}>
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

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, strong && styles.rowStrong]} numberOfLines={2}>
        {label}
      </Text>
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
