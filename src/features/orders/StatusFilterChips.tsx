import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { STATUS_FILTERS, type StatusFilter } from '@/features/orders/status';
import { strings } from '@/strings';
import { colors, radius, spacing, type } from '@/theme';

type Props = {
  value: StatusFilter;
  onChange: (filter: StatusFilter) => void;
};

/** Horizontally scrolling "All / Pending / Shipped / Delivered" chips. */
export function StatusFilterChips({ value, onChange }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.row}>
      {STATUS_FILTERS.map((filter) => {
        const selected = filter === value;
        return (
          <Pressable
            key={filter}
            onPress={() => onChange(filter)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            // 36px chip + 4px above and below = 44px touch target.
            hitSlop={{ top: 4, bottom: 4 }}
            style={({ pressed }) => [
              styles.chip,
              selected ? styles.chipSelected : pressed && styles.chipPressed,
            ]}>
            <Text style={[styles.label, selected && styles.labelSelected]}>{strings.filters[filter]}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Without this a horizontal ScrollView stretches to fill the screen height.
  scroll: { flexGrow: 0 },
  row: { gap: 8, paddingHorizontal: spacing.screen, paddingVertical: 4 },
  chip: {
    height: 36,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipPressed: { backgroundColor: colors.primarySoft },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  label: { ...type.chip, color: colors.text },
  labelSelected: { color: colors.onPrimary },
});
