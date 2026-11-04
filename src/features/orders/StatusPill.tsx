import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { isOrderStatus, STATUS_COLORS, statusLabel } from '@/features/orders/status';
import { colors, radius, type } from '@/theme';

// Statuses outside ORDER_STATUSES (e.g. added in the database later) get a neutral pill.
const UNKNOWN = { bg: colors.border, text: colors.textMuted };

// Small pop when the status changes. The inner view is keyed by status so a new
// value remounts it and replays the animation. Only once the status differs from
// what the pill first showed, so opening a list or screen doesn't make every pill pop.
const POP = ZoomIn.springify().damping(14).stiffness(260);

export function StatusPill({ status }: { status: string }) {
  const tone = isOrderStatus(status) ? STATUS_COLORS[status] : UNKNOWN;
  const [initialStatus] = useState(status);
  return (
    <Animated.View
      key={status}
      entering={status !== initialStatus ? POP : undefined}
      style={[styles.pill, { backgroundColor: tone.bg }]}>
      <Text style={[styles.label, { color: tone.text }]}>{statusLabel(status)}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pill: { alignSelf: 'flex-end', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  label: type.pill,
});
