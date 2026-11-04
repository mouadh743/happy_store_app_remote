import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { ORDER_STATUSES, STATUS_COLORS, type OrderStatus } from '@/features/orders/status';
import { strings } from '@/strings';
import { colors, radius, TOUCH_TARGET, type } from '@/theme';

type Props = {
  value: OrderStatus | null;
  onChange: (status: OrderStatus) => void;
  disabled?: boolean;
};

/** Radio list of every order status. */
export function StatusPicker({ value, onChange, disabled }: Props) {
  return (
    <View style={styles.group} accessibilityRole="radiogroup">
      {ORDER_STATUSES.map((status, index) => {
        const selected = status === value;
        return (
          <Pressable
            key={status}
            onPress={() => onChange(status)}
            disabled={disabled}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected, disabled }}
            style={({ pressed }) => [
              styles.row,
              index > 0 && styles.rowDivider,
              pressed && styles.rowPressed,
            ]}>
            <View style={[styles.dot, { backgroundColor: STATUS_COLORS[status].text }]} />
            <Text style={[styles.label, selected && styles.labelSelected]}>{strings.status[status]}</Text>
            <View style={[styles.radio, selected && styles.radioSelected]}>
              {selected ? <Animated.View entering={ZoomIn.duration(160)} style={styles.radioInner} /> : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  row: {
    minHeight: TOUCH_TARGET + 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
  },
  rowDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  rowPressed: { backgroundColor: colors.primarySoft },
  dot: { width: 8, height: 8, borderRadius: 4 },
  label: { ...type.bodyStrong, flex: 1, color: colors.text },
  labelSelected: { color: colors.primary },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.radioIdle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: colors.primary },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
});
